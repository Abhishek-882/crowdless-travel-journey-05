
import * as React from "react";
import { cn } from "@/lib/utils";

const Gallery = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("gallery overflow-hidden", className)}
    {...props}
  />
));
Gallery.displayName = "Gallery";

const GalleryImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("gallery-image object-cover transition-all hover:scale-105", className)}
    alt={alt}
    {...props}
  />
));
GalleryImage.displayName = "GalleryImage";

export { Gallery, GalleryImage };
