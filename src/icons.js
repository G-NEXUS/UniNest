import { icons } from 'lucide';
import { h } from './runtime.js';

const createIcon = (name) => (props = {}) => {
  const source = icons[name] || [];
  const { className = '', ...rest } = props;
  return h('svg', {
    ...rest,
    className,
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.width || 24,
    height: props.height || 24,
    viewBox: '0 0 24 24',
    fill: props.fill || 'none',
    stroke: props.stroke || 'currentColor',
    'stroke-width': props['stroke-width'] || 2,
    'stroke-linecap': props['stroke-linecap'] || 'round',
    'stroke-linejoin': props['stroke-linejoin'] || 'round',
    'aria-hidden': props['aria-hidden'] || 'true',
  }, source.map(([tag, attrs], index) => h(tag, { ...attrs, key: index })));
};

export const AlertCircle = createIcon('AlertCircle');
export const AlertTriangle = createIcon('AlertTriangle');
export const ArrowRight = createIcon('ArrowRight');
export const BadgeCheck = createIcon('BadgeCheck');
export const Building = createIcon('Building');
export const Check = createIcon('Check');
export const CheckCircle2 = createIcon('CheckCircle2');
export const ChevronDown = createIcon('ChevronDown');
export const ChevronLeft = createIcon('ChevronLeft');
export const ChevronRight = createIcon('ChevronRight');
export const Clock = createIcon('Clock');
export const Copy = createIcon('Copy');
export const CreditCard = createIcon('CreditCard');
export const DollarSign = createIcon('DollarSign');
export const Droplets = createIcon('Droplets');
export const ExternalLink = createIcon('ExternalLink');
export const Flag = createIcon('Flag');
export const Heart = createIcon('Heart');
export const Home = createIcon('Home');
export const Info = createIcon('Info');
export const Key = createIcon('Key');
export const Lock = createIcon('Lock');
export const LockOpen = createIcon('LockOpen');
export const MapPin = createIcon('MapPin');
export const Menu = createIcon('Menu');
export const MessageSquare = createIcon('MessageSquare');
export const Phone = createIcon('Phone');
export const Plus = createIcon('Plus');
export const Receipt = createIcon('Receipt');
export const RotateCcw = createIcon('RotateCcw');
export const Search = createIcon('Search');
export const Share2 = createIcon('Share2');
export const ShieldAlert = createIcon('ShieldAlert');
export const ShieldCheck = createIcon('ShieldCheck');
export const SlidersHorizontal = createIcon('SlidersHorizontal');
export const Smartphone = createIcon('Smartphone');
export const Sparkles = createIcon('Sparkles');
export const Star = createIcon('Star');
export const Trash2 = createIcon('Trash2');
export const UploadCloud = createIcon('UploadCloud');
export const User = createIcon('User');
export const UserCheck = createIcon('UserCheck');
export const Users = createIcon('Users');
export const Wifi = createIcon('Wifi');
export const XCircle = createIcon('XCircle');
export const Zap = createIcon('Zap');

export const X = createIcon('X');
