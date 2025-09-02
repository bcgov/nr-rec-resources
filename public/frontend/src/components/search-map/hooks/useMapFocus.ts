import { RefObject, useEffect, useState } from 'react';
import OLMap from 'ol/Map';
import Feature from 'ol/Feature';
import { SearchMapFocusModes } from '@/components/search-map/constants';
import Overlay from 'ol/Overlay';
import { useMapFocusParam } from '@/components/search-map/hooks/useMapFocusParam';
import { useGetRecreationResourceById } from '@/service/queries/recreation-resource';
import { focusRecResourceOnMap } from '@/components/search-map/hooks/helpers';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';

export interface UseMapFocusProps {
  mapRef: RefObject<{ getMap: () => OLMap } | null>;
  onFocusedFeatureChange: (feature: Feature | null) => void;
  overlayRef: RefObject<Overlay | null>;
}

export function useMapFocus({
  mapRef,
  onFocusedFeatureChange: onFocusedFeatureChange,
  overlayRef,
}: UseMapFocusProps) {
  const [focusCenter, setFocusCenter] = useState<Coordinate>();
  const [focusExtent, setFocusExtent] = useState<Extent>();
  const [didFocus, setDidFocus] = useState(false);
  const { mode, value, resetParams } = useMapFocusParam();
  const [isMapFocusLoading, setIsMapFocusLoading] = useState(
    mode === SearchMapFocusModes.REC_RESOURCE_ID,
  );

  const { data: recResource } = useGetRecreationResourceById({ id: value });

  useEffect(() => {
    if (
      didFocus ||
      mode !== SearchMapFocusModes.REC_RESOURCE_ID ||
      !value ||
      !recResource
    )
      return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const focusResult = focusRecResourceOnMap(
      map,
      recResource,
      onFocusedFeatureChange,
    );

    if (!focusResult) return;

    const { focusCenter, focusExtent } = focusResult;
    overlayRef.current?.setPosition(focusCenter);
    setFocusCenter(focusCenter);
    setFocusExtent(focusExtent);

    map.once('rendercomplete', () => {
      const mapView = map.getView();
      mapView.fit(focusExtent, { maxZoom: 12 });

      setDidFocus(true);
      setIsMapFocusLoading(false);
      resetParams();
    });
  }, [
    mapRef,
    didFocus,
    onFocusedFeatureChange,
    mode,
    overlayRef,
    resetParams,
    value,
    recResource,
  ]);

  return {
    isMapFocusLoading,
    focusCenter,
    focusExtent,
  };
}
