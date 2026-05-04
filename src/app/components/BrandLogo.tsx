import { Link } from "react-router";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  linked?: boolean;
};

export function BrandLogo({ className = "", imageClassName = "", linked = true }: BrandLogoProps) {
  const logo = (
    <img
      src="/brand-logo.svg"
      alt="Ecophant Auto Ceramic Pro East Boca Raton Elite Dealer"
      className={`block h-auto w-full ${imageClassName}`}
    />
  );

  if (!linked) {
    return <div className={className}>{logo}</div>;
  }

  return (
    <Link to="/" className={`block ${className}`} aria-label="Ecophant Auto home">
      {logo}
    </Link>
  );
}
