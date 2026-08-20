import styles from './StepList.module.css';

export default function StepList({ steps = [] }) {
  if (!steps.length) return null;

  return (
    <div className={styles.list}>
      {steps.map((step, index) => (
        <div key={step.id || index} className={styles.step}>
          <div className={styles.number}>{step.step_number || index + 1}</div>
          <div className={styles.instruction}>{step.instruction}</div>
        </div>
      ))}
    </div>
  );
}
