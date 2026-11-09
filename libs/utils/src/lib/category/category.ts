import {
  DEFAULT_CATEGORY,
  EXPENSE_CATEGORIES,
  TRANSACTION_LIMITS,
  type ExpenseCategory,
} from '@shared-types';

/** Extra search words per category: used for typeahead and alias matching. */
export const CATEGORY_KEYWORDS: Readonly<
  Partial<Record<ExpenseCategory, readonly string[]>>
> = {
  'Bills & Utilities': ['bill', 'bills', 'utility', 'water', 'gas', 'dth', 'recharge'],
  'Books & Courses': ['book', 'books', 'course', 'udemy', 'coaching'],
  'Cab & Auto': ['cab', 'auto', 'uber', 'ola', 'rapido', 'taxi'],
  'Coffee & Snacks': ['coffee', 'tea', 'snack', 'snacks', 'chai', 'cafe', 'bakery'],
  'EMI & Loans': ['emi', 'loan', 'credit card', 'mortgage'],
  'Food & Dining': ['food', 'dining', 'restaurant', 'swiggy', 'zomato', 'lunch', 'dinner', 'breakfast', 'eating out'],
  'Gifts & Donations': ['gift', 'gifts', 'donation', 'charity', 'temple'],
  'Hotels & Stay': ['hotel', 'stay', 'airbnb', 'hostel', 'lodging'],
  'Kids & Family': ['kids', 'kid', 'child', 'family', 'baby', 'school fees'],
  'Mobile & Internet': ['mobile', 'phone', 'internet', 'wifi', 'broadband', 'airtel', 'jio'],
  'Movies & Events': ['movie', 'movies', 'cinema', 'event', 'concert', 'show'],
  'Personal Care': ['salon', 'haircut', 'spa', 'grooming', 'cosmetics'],
  'Taxes & Fees': ['tax', 'taxes', 'fee', 'fees', 'fine', 'challan'],
  Business: ['office', 'work', 'client'],
  Clothing: ['clothes', 'clothing', 'apparel', 'shoes', 'fashion'],
  Education: ['school', 'college', 'tuition', 'exam'],
  Electricity: ['electric', 'power', 'current bill'],
  Electronics: ['gadget', 'laptop', 'mobile phone', 'charger', 'headphones'],
  Entertainment: ['fun', 'games', 'gaming', 'outing'],
  Fitness: ['gym', 'yoga', 'sports', 'workout'],
  Fuel: ['petrol', 'diesel', 'cng', 'gas station'],
  Groceries: ['grocery', 'vegetables', 'fruits', 'milk', 'supermarket', 'bigbasket', 'blinkit', 'zepto'],
  Health: ['doctor', 'hospital', 'clinic', 'medical', 'lab test'],
  'Home & Maintenance': ['home', 'repair', 'maintenance', 'furniture', 'plumber', 'maid'],
  Insurance: ['premium', 'policy'],
  Investments: ['investment', 'mutual fund', 'sip', 'stocks', 'gold', 'fd'],
  Medicines: ['medicine', 'pharmacy', 'tablets', 'drugs'],
  Pets: ['pet', 'dog', 'cat', 'vet'],
  Rent: ['house rent', 'pg', 'landlord'],
  Shopping: ['amazon', 'flipkart', 'mall', 'myntra', 'purchase'],
  Subscriptions: ['subscription', 'netflix', 'spotify', 'prime', 'youtube', 'ott'],
  Transport: ['bus', 'metro', 'train', 'commute', 'toll', 'parking'],
  Travel: ['trip', 'flight', 'vacation', 'holiday', 'tour', 'ticket'],
};

const norm = (value: string): string => value.trim().toLowerCase();

const EXACT = new Map<string, ExpenseCategory>(
  EXPENSE_CATEGORIES.map((category) => [norm(category), category])
);

/**
 * Normalizes a category the user typed. Known names are matched
 * case-insensitively to their canonical spelling; any other text is kept as
 * typed (a custom category, e.g. "Cooler"). Empty input stays empty.
 */
export function normalizeCategory(input: string | null | undefined): string {
  const text = (input ?? '').trim().replace(/\s+/g, ' ');
  if (!text) {
    return DEFAULT_CATEGORY;
  }
  return EXACT.get(norm(text)) ?? text.slice(0, TRANSACTION_LIMITS.categoryMaxLength);
}

/** Typeahead filter: matches the category name or any of its keywords. */
export function categoryMatchesQuery(category: string, query: string): boolean {
  const q = norm(query);
  if (!q) {
    return true;
  }
  if (norm(category).includes(q)) {
    return true;
  }
  const words = CATEGORY_KEYWORDS[category as ExpenseCategory] ?? [];
  return words.some((word) => word.includes(q));
}
