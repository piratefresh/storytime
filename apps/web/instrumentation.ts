import { getDriver } from '@repo/db';

export function register(): void {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.NEXT_MANUAL_SIG_HANDLE) {
      process.on('SIGTERM', () => {
        const driver = getDriver();
        if (driver) {
          // @ts-expect-error - fix later
          driver.close();
        }
      });
    }
  }
}
