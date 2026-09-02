import { useAuth } from '../../contexts/AuthContext';
import styles from './DemoBanner.module.css';

export default function DemoBanner() {
  const { user } = useAuth();

  if (user?.email !== 'demo_admin@prepkitchen.com') {
    return null;
  }

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>⚠️</span>
      Modo Demo: Los cambios realizados en esta cuenta son temporales. Los datos se restauran automáticamente cada 30 minutos.
    </div>
  );
}
