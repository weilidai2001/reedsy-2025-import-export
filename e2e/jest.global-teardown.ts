import { ChildProcess } from 'child_process';
import kill from 'tree-kill';

export default async () => {
  console.log('\nStopping services...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processes = (global as any).__E2E_PROCESSES__ as ChildProcess[];

  if (processes && processes.length > 0) {
    for (const process of processes) {
      if (process.pid) {
        try {
          await new Promise<void>((resolve, reject) => {
            kill(process.pid!, err => {
              if (err) {
                console.error(`Failed to kill process tree for PID ${process.pid}:`, err);
                return reject(err);
              }
              console.log(`Successfully killed process tree for PID ${process.pid}.`);
              resolve();
            });
          });
        } catch (error) {
          console.error(`Error killing process ${process.pid}:`, error);
        }
      }
    }
    console.log('All services stopped.');
  } else {
    console.log('No services to stop.');
  }
};
