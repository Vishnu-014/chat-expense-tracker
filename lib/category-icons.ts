import {
  Home,
  Car,
  Bus,
  Bike,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Receipt,
  HeartPulse,
  Plane,
  Coffee,
  Shirt,
  Tv,
  GraduationCap,
  Gift,
  HandHeart,
  Smartphone,
  Dumbbell,
  Film,
  Music,
  PiggyBank,
  Briefcase,
  Zap,
  Droplet,
  Wifi,
  Phone,
  TrendingDown,
  DollarSign,
  ChartCandlestick,
  Utensils,
} from 'lucide-react';

export const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();

  if (
    categoryLower.includes('food') ||
    categoryLower.includes('restaurant') ||
    categoryLower.includes('eating')
  )
    return Utensils;
  if (
    categoryLower.includes('transport') ||
    categoryLower.includes('taxi') ||
    categoryLower.includes('uber')
  )
    return Car;
  if (categoryLower.includes('bus')) return Bus;
  if (categoryLower.includes('bike') || categoryLower.includes('cycle'))
    return Bike;
  if (categoryLower.includes('shopping') || categoryLower.includes('retail'))
    return ShoppingBag;
  if (
    categoryLower.includes('salary') ||
    categoryLower.includes('income') ||
    categoryLower.includes('wage')
  )
    return Wallet;
  if (
    categoryLower.includes('investment') ||
    categoryLower.includes('stock') ||
    categoryLower.includes('mutual')
  )
    return ChartCandlestick;
  if (
    categoryLower.includes('bill') ||
    categoryLower.includes('utility') ||
    categoryLower.includes('utilities')
  )
    return Receipt;
  if (
    categoryLower.includes('health') ||
    categoryLower.includes('medical') ||
    categoryLower.includes('medicine')
  )
    return HeartPulse;
  if (
    categoryLower.includes('travel') ||
    categoryLower.includes('flight') ||
    categoryLower.includes('vacation')
  )
    return Plane;
  if (categoryLower.includes('coffee') || categoryLower.includes('cafe'))
    return Coffee;
  if (
    categoryLower.includes('clothing') ||
    categoryLower.includes('fashion') ||
    categoryLower.includes('apparel')
  )
    return Shirt;
  if (
    categoryLower.includes('rent') ||
    categoryLower.includes('housing') ||
    categoryLower.includes('mortgage')
  )
    return Home;
  if (
    categoryLower.includes('entertainment') ||
    categoryLower.includes('streaming') ||
    categoryLower.includes('subscription')
  )
    return Tv;
  if (
    categoryLower.includes('education') ||
    categoryLower.includes('course') ||
    categoryLower.includes('tuition')
  )
    return GraduationCap;
  if (categoryLower.includes('gift') || categoryLower.includes('donation'))
    return Gift;
  if (categoryLower.includes('charity') || categoryLower.includes('goodwill'))
    return HandHeart;
  if (
    categoryLower.includes('electronics') ||
    categoryLower.includes('gadget') ||
    categoryLower.includes('phone')
  )
    return Smartphone;
  if (
    categoryLower.includes('fitness') ||
    categoryLower.includes('gym') ||
    categoryLower.includes('sport') ||
    categoryLower.includes('leisure')
  )
    return Dumbbell;
  if (categoryLower.includes('movie') || categoryLower.includes('cinema'))
    return Film;
  if (categoryLower.includes('music') || categoryLower.includes('concert'))
    return Music;
  if (categoryLower.includes('savings') || categoryLower.includes('deposit'))
    return PiggyBank;
  if (categoryLower.includes('freelance') || categoryLower.includes('business'))
    return Briefcase;
  if (categoryLower.includes('electricity') || categoryLower.includes('power'))
    return Zap;
  if (categoryLower.includes('water')) return Droplet;
  if (categoryLower.includes('internet') || categoryLower.includes('broadband'))
    return Wifi;
  if (categoryLower.includes('mobile') || categoryLower.includes('recharge'))
    return Phone;
  if (categoryLower.includes('refund') || categoryLower.includes('cashback'))
    return TrendingDown;
  if (categoryLower.includes('groceries')) return ShoppingBag;

  return DollarSign;
};
