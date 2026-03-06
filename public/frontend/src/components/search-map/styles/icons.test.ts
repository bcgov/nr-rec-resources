import { describe, it, expect } from 'vitest';
import {
  createSITIcon,
  createRTEIcon,
  createIFIcon,
} from '@/components/search-map/styles/icons';
import SIT_ICON from '@shared/assets/icons/recreation_site.svg';
import SIT_ICON_CLOSED from '@shared/assets/icons/recreation_site_closed.svg';
import SIT_ICON_SELECTED from '@shared/assets/icons/recreation_site_selected.svg';
import RTE_ICON from '@shared/assets/icons/recreation_trail.svg';
import RTE_ICON_CLOSED from '@shared/assets/icons/recreation_trail_closed.svg';
import RTE_ICON_SELECTED from '@shared/assets/icons/recreation_trail_selected.svg';
import IF_ICON from '@shared/assets/icons/interpretive_forest.svg';
import IF_ICON_CLOSED from '@shared/assets/icons/interpretive_forest_closed.svg';
import IF_ICON_SELECTED from '@shared/assets/icons/interpretive_forest_selected.svg';
import { Icon } from 'ol/style';

describe('Recreation Site Icons', () => {
  it('createSITIcon creates default variant', () => {
    const icon = createSITIcon().getImage() as Icon;
    expect(icon).toBeInstanceOf(Icon);
    expect(icon.getSrc()).toBe(SIT_ICON);
    expect(icon.getScale()).toBe(0.8);
    expect(icon.getOpacity()).toBe(1);
  });

  it('createSITIcon creates closed variant', () => {
    const icon = createSITIcon({ variant: 'closed' }).getImage() as Icon;
    expect(icon.getSrc()).toBe(SIT_ICON_CLOSED);
    expect(icon.getScale()).toBe(0.8);
  });

  it('createSITIcon creates selected variant', () => {
    const icon = createSITIcon({ variant: 'selected' }).getImage() as Icon;
    expect(icon.getSrc()).toBe(SIT_ICON_SELECTED);
    expect(icon.getScale()).toBe(0.8);
  });

  it('createSITIcon accepts custom opacity and scale', () => {
    const icon = createSITIcon({ opacity: 0.7, scale: 1.0 }).getImage() as Icon;
    expect(icon.getOpacity()).toBe(0.7);
    expect(icon.getScale()).toBe(1.0);
  });
});

describe('Recreation Trail Icons', () => {
  it('createRTEIcon creates default variant', () => {
    const icon = createRTEIcon().getImage() as Icon;
    expect(icon.getSrc()).toBe(RTE_ICON);
    expect(icon.getScale()).toBe(0.8);
  });

  it('createRTEIcon creates closed variant', () => {
    const icon = createRTEIcon({ variant: 'closed' }).getImage() as Icon;
    expect(icon.getSrc()).toBe(RTE_ICON_CLOSED);
  });

  it('createRTEIcon creates selected variant', () => {
    const icon = createRTEIcon({ variant: 'selected' }).getImage() as Icon;
    expect(icon.getSrc()).toBe(RTE_ICON_SELECTED);
  });
});

describe('Interpretive Forest Icons', () => {
  it('createIFIcon creates default variant', () => {
    const icon = createIFIcon().getImage() as Icon;
    expect(icon.getSrc()).toBe(IF_ICON);
    expect(icon.getScale()).toBe(0.8);
  });

  it('createIFIcon creates closed variant', () => {
    const icon = createIFIcon({ variant: 'closed' }).getImage() as Icon;
    expect(icon.getSrc()).toBe(IF_ICON_CLOSED);
  });

  it('createIFIcon creates selected variant', () => {
    const icon = createIFIcon({ variant: 'selected' }).getImage() as Icon;
    expect(icon.getSrc()).toBe(IF_ICON_SELECTED);
  });
});
