import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      sidebar: {
        dashboard: "Dashboard",
        money: "e-Money",
        tasks: "e-Tasks",
        reminders: "e-Reminders",
        notes: "e-Notes",
        platform: "Platform",
        logout: "Log out",
        user_fallback_name: "User",
        user_fallback_email: "user@example.com",
        user_initial: "U"
      },
      navbar: {
        greeting_morning: "Good morning",
        greeting_afternoon: "Good afternoon",
        greeting_night: "Good night"
      },
      money: {
        title: "Eedoo Money",
        subtitle: "Track your expenses, income, and debts.",
        nav_dashboard: "Dashboard",
        nav_transactions: "Transactions",
        nav_people: "People",
        cash_balance: "Cash Balance",
        net_position: "Net Position",
        income: "Income",
        expenses: "Expenses",
        owed_to_you: "Owed to You",
        you_owe: "You Owe",
        view_transactions: "View Transactions",
        manage_people: "Manage People",
        currency: "EGP",
        loading_failed: "Failed to load summary."
      },
      people: {
        title: "People",
        cancel: "Cancel",
        save: "Save",
        name: "Name",
        name_placeholder: "e.g. Mohamed",
        view_details_hint: "View details to see balance",
        view_details: "View Details",
        delete: "Delete",
        add_person: "Add Person",
        no_people: "No people found."
      },
      transactions: {
        title: "Transactions",
        new_transaction: "New Transaction",
        cancel: "Cancel",
        amount: "Amount",
        type: "Type",
        date: "Date",
        category: "Category",
        description: "Description (Optional)",
        desc_placeholder: "What was this for?",
        save_transaction: "Save Transaction",
        actions: "Actions",
        delete: "Delete",
        type_expense: "Personal Expense",
        type_income: "Income",
        type_lent: "Lent to Person",
        type_borrowed: "Borrowed from Person",
        type_received: "Received from Person",
        type_repaid: "Repaid to Person",
        cat_uncategorized: "Uncategorized",
        add_transaction: "Add Transaction"
      },
      home: {
        title: "What can I help you with ?",
        subtitle: "Welcome to Eedoo. I am your intelligent control layer.",
        placeholder: "Ask Eedoo anything..."
      }
    }
  },
  ar: {
    translation: {
      sidebar: {
        dashboard: "الخلاصة",
        money: "القرشين",
        tasks: "المصالح",
        reminders: "زنان المواعيد",
        notes: "الكشكول",
        platform: "الروقان كله",
        logout: "أخلع",
        user_fallback_name: "يا صاحبي",
        user_fallback_email: "صاحب القهوة",
        user_initial: "م"
      },
      navbar: {
        greeting_morning: "صباح الفل",
        greeting_afternoon: "مساء الورد",
        greeting_night: "تصبح على خير"
      },
      money: {
        title: "إيدو للفلوس",
        subtitle: "ظبط ميزانيتك، اللي داخل واللي طالع واللي ليك واللي عليك.",
        nav_dashboard: "الخلاصة",
        nav_transactions: "الحركات",
        nav_people: "الشلة",
        cash_balance: "الكاش اللي معاك",
        net_position: "الصافي بتاعك",
        income: "اللي داخل",
        expenses: "اللي اتصرف",
        owed_to_you: "ليك بره",
        you_owe: "عليك للناس",
        view_transactions: "شوف الحركات",
        manage_people: "ظبط الشلة",
        currency: "جنية",
        loading_failed: "المصلحة باظت، مش عارفين نجيب الملخص."
      },
      people: {
        title: "الشلة",
        cancel: "فكك",
        save: "سجل",
        name: "الاسم",
        name_placeholder: "مثال: محمد",
        view_details_hint: "خش عشان تشوف الحساب",
        view_details: "التفاصيل",
        delete: "طير",
        add_person: "ضيف حد",
        no_people: "مفيش حد لسة."
      },
      transactions: {
        title: "الحركات",
        new_transaction: "حركة جديدة",
        cancel: "فكك",
        amount: "المبلغ",
        type: "النوع",
        date: "التاريخ",
        category: "التصنيف",
        description: "التفاصيل (براحتك)",
        desc_placeholder: "بتاعة إيه دي؟",
        save_transaction: "سجل الحركة",
        actions: "ظبط",
        delete: "امسح",
        type_expense: "مصروف شخصي",
        type_income: "دخل",
        type_lent: "سلفت حد",
        type_borrowed: "استلفت من حد",
        type_received: "أخدت فلوس من حد",
        type_repaid: "رجعت فلوس لحد",
        cat_uncategorized: "بدون تصنيف",
        add_transaction: "ضيف حركة"
      },
      home: {
        title: "أقدر أساعدك في إيه؟",
        subtitle: "يا مرحب بيك في إيدو. أنا الدماغ اللي بتظبطلك دنيتك.",
        placeholder: "إسأل إيدو في أي حاجة..."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('eedoo_lang') || 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
