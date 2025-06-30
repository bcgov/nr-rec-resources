import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './ResourceHeaderSection.module.scss';

export const ResourceHeaderSection = ({
  name,
  recId,
}: {
  name: string;
  recId: string;
}) => (
  <div className={styles['resource-header-section']}>
    <div className={styles['resource-header-title']}>
      <h2>{name}</h2>
      <span className={styles['resource-badge']}>{recId}</span>
    </div>
    <div className={styles['upload-buttons']}>
      <Button variant="outline-primary">
        <FontAwesomeIcon icon={faPlus} />
        Upload image
      </Button>
      <Button variant="outline-primary">
        <FontAwesomeIcon icon={faPlus} />
        Upload document
      </Button>
    </div>
  </div>
);
