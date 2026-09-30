/**
 * Thin-line UI icons.
 *
 * The repository has no icon dependency and the approved mockups use a single
 * consistent hairline icon language (search / account / bag / arrow). Rather
 * than pull in a library and mix families, these are minimal inline SVGs that
 * inherit `currentColor` and the surrounding type size.
 *
 * Every icon is decorative by default (`aria-hidden`). Interactive elements
 * must supply their own accessible name on the button or link.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false'
};

function Svg({ className = 'h-5 w-5', children, ...rest }) {
  return (
    <svg {...base} {...rest} className={className}>
      {children}
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Svg>
  );
}

export function IconAccount(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.75 20c0-3.6 3.25-6 7.25-6s7.25 2.4 7.25 6" />
    </Svg>
  );
}

export function IconBag(props) {
  return (
    <Svg {...props}>
      <path d="M5.25 7.5h13.5l-1 12.25H6.25L5.25 7.5z" />
      <path d="M9 7.5V6a3 3 0 0 1 6 0v1.5" />
    </Svg>
  );
}

export function IconArrowRight(props) {
  return (
    <Svg {...props}>
      <path d="M4 12h15.5" />
      <path d="M13.5 6l6 6-6 6" />
    </Svg>
  );
}

export function IconChevronDown(props) {
  return (
    <Svg {...props}>
      <path d="M5.5 9l6.5 6.5L18.5 9" />
    </Svg>
  );
}

export function IconClose(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function IconMenu(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
    </Svg>
  );
}

export function IconHeart({ filled = false, ...props }) {
  return (
    <Svg {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.5 2.2C19.5 15.4 12 20 12 20z" />
    </Svg>
  );
}

export function IconPlus(props) {
  return (
    <Svg {...props}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Svg>
  );
}

export function IconMinus(props) {
  return (
    <Svg {...props}>
      <path d="M5.5 12h13" />
    </Svg>
  );
}

export function IconCheck(props) {
  return (
    <Svg {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function IconDrop(props) {
  return (
    <Svg {...props}>
      <path d="M12 3.5s5.5 6 5.5 10a5.5 5.5 0 0 1-11 0c0-4 5.5-10 5.5-10z" />
    </Svg>
  );
}
