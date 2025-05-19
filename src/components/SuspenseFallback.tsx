import React from 'react';
// @ts-ignore
import styles from './SuspenseFallback.module.css';

const SuspenseFallback = () => {
    return (
        <div className={styles.container}>
            <div className={styles.orbit}>
                <div className={styles.sphere}></div>
                <div className={styles.sphere}></div>
                <div className={styles.sphere}></div>
            </div>
            <div className={styles.text}>Loading Magic...</div>
        </div>
    );
};

export default SuspenseFallback;