/**
 * @fileoverview Footer component with author attribution.
 *
 * @module components/common/footer
 */

/**
 * Application footer with author credit.
 */
export function Footer() {
  return (
    <footer className="py-4 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Designed and Developed by <span className="font-medium text-foreground">Utpal Sen</span>
        </p>
      </div>
    </footer>
  );
}
