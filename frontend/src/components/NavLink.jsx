import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/utils";

const NavLink = forwardRef(({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Preload the route on hover
    if (typeof to === 'string') {
      // React Router will preload the component when the link is hovered
      // This is a simple hint that works with lazy-loaded routes
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = to;
      document.head.appendChild(link);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <RouterNavLink
      ref={ref}
      to={to}
      className={({ isActive, isPending }) =>
        cn(className, isActive && activeClassName, isPending && pendingClassName)
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
});

NavLink.displayName = "NavLink";

export { NavLink };
