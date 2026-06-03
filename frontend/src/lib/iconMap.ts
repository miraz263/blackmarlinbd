import {
  Users, Database, Store, Package, MessageSquare, HardHat,
  UtensilsCrossed, Hotel, CalendarCheck, MenuSquare,
  BarChart2, Shield, Briefcase, Wallet, TrendingUp,
  ShoppingCart, ShoppingBag, Boxes,
  GraduationCap, BookOpen, ClipboardList, PenLine,
  Heart, Stethoscope, UserSearch, FileHeart,
  Newspaper, LayoutTemplate,
  CalendarDays, Ticket,
  Brain, MessageCircleMore, HelpCircle,
  Building2, FileStack, Contact,
  Zap, Globe, Package2, Box,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Users, Database, Store, Package, MessageSquare, HardHat,
  UtensilsCrossed, Hotel, CalendarCheck, MenuSquare,
  BarChart2, Shield, Briefcase, Wallet, TrendingUp,
  ShoppingCart, ShoppingBag, Boxes,
  GraduationCap, BookOpen, ClipboardList, PenLine,
  Heart, Stethoscope, UserSearch, FileHeart,
  Newspaper, LayoutTemplate,
  CalendarDays, Ticket,
  Brain, MessageCircleMore, HelpCircle,
  Building2, FileStack, Contact,
  Zap, Globe, Package2, Box,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Package2;
}
