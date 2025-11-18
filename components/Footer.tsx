import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>© {new Date().getFullYear()} MedIndex. Helping pre-med students find their perfect medical school.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-sm text-muted-foreground">
              If you like this project, consider{' '}
              <Link
                href="https://github.com/sponsors/AceHorizon1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                supporting it
              </Link>
              {' '}or{' '}
              <Link
                href="https://github.com/AceHorizon1/medindex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                starring on GitHub
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for future physicians
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

