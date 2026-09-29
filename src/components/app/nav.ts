import {
  Activity,
  AlertTriangle,
  Archive,
  BadgeCheck,
  Bell,
  Boxes,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  FileCheck2,
  FileText,
  Flag,
  Footprints,
  Gauge,
  GitMerge,
  HardDrive,
  HelpCircle,
  KeyRound,
  Layers,
  LayoutDashboard,
  Leaf,
  ListChecks,
  Map,
  MapPin,
  Package,
  PackageCheck,
  PlugZap,
  Radio,
  RefreshCw,
  Route,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Tablet,
  Trash2,
  Truck,
  UserCog,
  Users,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Command",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Notifications", to: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Expedition",
    items: [
      { label: "Expeditions", to: "/expeditions", icon: Flag },
      { label: "Readiness", to: "/expeditions/46th-isea/readiness", icon: ListChecks },
      { label: "Timeline", to: "/timeline", icon: CalendarRange },
    ],
  },
  {
    label: "Logistics",
    items: [
      { label: "Cargo", to: "/cargo", icon: Package },
      { label: "Demands", to: "/demands", icon: ClipboardList },
      { label: "Containers", to: "/containers", icon: Boxes },
      { label: "Manifests", to: "/manifests", icon: ScrollText },
      { label: "Checkpoints", to: "/checkpoints", icon: MapPin },
      { label: "Exceptions", to: "/exceptions", icon: AlertTriangle },
      { label: "Backhaul", to: "/backhaul", icon: Truck },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Inventory", to: "/inventory", icon: Warehouse },
      { label: "Critical Inventory", to: "/critical-inventory", icon: Gauge },
      { label: "Assets", to: "/assets", icon: HardDrive },
      { label: "Maintenance", to: "/maintenance", icon: Wrench },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Personnel", to: "/personnel", icon: Users },
      { label: "Assignments", to: "/assignments", icon: BadgeCheck },
      { label: "Movement", to: "/movement", icon: Footprints },
      { label: "Muster", to: "/muster", icon: ClipboardCheck },
    ],
  },
  { label: "Field Operations", items: [{ label: "Sorties", to: "/sorties", icon: Route }] },
  {
    label: "Safety & Response",
    items: [
      { label: "Incidents", to: "/incidents", icon: Siren },
      { label: "Incident Command", to: "/incidents/INC-024", icon: Radio },
      { label: "Drills", to: "/drills", icon: Activity },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "Permits", to: "/permits", icon: FileCheck2 },
      { label: "Environment", to: "/environment", icon: Leaf },
      { label: "Biosecurity", to: "/biosecurity", icon: ShieldCheck },
      { label: "Waste", to: "/waste", icon: Trash2 },
      { label: "Post-Activity Reports", to: "/post-activity-reports", icon: FileText },
      { label: "Audit", to: "/audit", icon: ShieldAlert },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Sync", to: "/sync", icon: RefreshCw },
      { label: "Conflicts", to: "/conflicts", icon: GitMerge },
      { label: "Edge Nodes", to: "/edge-nodes", icon: Cpu },
      { label: "Devices", to: "/devices", icon: Tablet },
      { label: "Integrations", to: "/integrations", icon: PlugZap },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users", to: "/users", icon: UserCog },
      { label: "Roles", to: "/roles", icon: KeyRound },
      { label: "Rules", to: "/rules", icon: Layers },
      { label: "Forms", to: "/forms", icon: Archive },
      { label: "Reports", to: "/reports", icon: PackageCheck },
    ],
  },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: "System Status", to: "/system-status", icon: Sparkles },
  { label: "Help", to: "/help", icon: HelpCircle },
];

export const MOBILE_TABS: NavItem[] = [
  { label: "Command", to: "/dashboard", icon: LayoutDashboard },
  { label: "Cargo", to: "/cargo", icon: Package },
  { label: "Edge", to: "/edge", icon: Tablet },
  { label: "Incidents", to: "/incidents", icon: Siren },
];

export { Map };
