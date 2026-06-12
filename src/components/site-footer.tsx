import { Link } from "react-router-dom";
import { Sparkles, Instagram, Twitter, Youtube } from "lucide-react";
import logoImg from "@/assets/log.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-y-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-16">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logoImg}
                alt="Pravixo"
                className="h-8 w-auto object-contain"
              />
              <span className="font-display text-lg font-bold">Pravixo</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Where brands and creators meet. Discover, connect, and launch
              unforgettable campaigns.
            </p>
            <div className="mt-4 flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 md:justify-self-end md:gap-x-16">
            <div>
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/browse" className="hover:text-foreground">
                    Browse creators
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/customer"
                    className="hover:text-foreground"
                  >
                    For brands
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/influencer"
                    className="hover:text-foreground"
                  >
                    For creators
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Pravixo. Crafted with creators in mind.
        </div>
      </div>
    </footer>
  );
}
