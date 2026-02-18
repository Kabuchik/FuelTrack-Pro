import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Fuel, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Upload,
  Trash2,
  ChevronRight,
  TrendingUp,
  CreditCard,
  MapPin,
  Sparkles,
  Mail,
  Loader2,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Settings as SettingsIcon,
  UserPlus,
  Languages,
  AlertCircle,
  Pencil,
  FileSpreadsheet,
  Calendar,
  XCircle,
  Filter,
  Lock,
  Eye,
  EyeOff,
  Key,
  RotateCcw,
  Database,
  Save,
  UploadCloud,
  ArrowRight
} from 'lucide-react';
import { ViewType, Client, FuelTransaction, AuthUser, Role, UserPermissions } from './types';
import * as XLSX from 'xlsx';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { downloadInvoice, downloadConsolidatedInvoice } from './utils/export';
import { getFuelInsights } from './services/geminiService';

type Language = 'en' | 'uk';

const translations = {
  en: {
    overview: 'Overview',
    clients: 'Clients',
    transactions: 'Transactions',
    settings: 'Settings',
    userManagement: 'User Management',
    dataManagement: 'Data Management',
    search: 'Search anything...',
    importClients: 'Import Clients',
    importFuel: 'Import Fuel',
    newUser: 'Invite User',
    editUser: 'Edit User',
    newClient: 'New Client',
    editClient: 'Edit Client',
    editTransaction: 'Edit Transaction',
    recordFuel: 'Record Fuel',
    totalLiters: 'Total Liters',
    revenue: 'Estimated Revenue',
    margin: 'Margin Generated',
    intelligence: 'Intelligence Dashboard',
    aiDescription: "Our integrated Gemini AI analyzes consumption to identify irregularities and optimize routes.",
    getInsights: 'Get Smart Insights',
    analyzing: 'Analyzing Fleet...',
    liveActivity: 'Live Activity Feed',
    viewLedger: 'View Ledger',
    idRef: 'ID Reference',
    identity: 'Client Identity',
    activeCards: 'Active Cards',
    operations: 'Operations',
    noClients: 'No clients onboarded',
    logEntry: 'Log Entry',
    account: 'Account',
    assetCard: 'Asset Card',
    station: 'Station',
    stationAddress: 'Gas Station Address',
    liters: 'Liters',
    invoiceTotal: 'Invoice Total',
    welcome: 'Welcome back',
    logout: 'Log Out',
    staff: 'Staff',
    admin: 'Administrator',
    readOnly: 'Access restricted by administrator.',
    internalId: 'Internal ID #',
    marginL: 'Margin (UAH/L)',
    accountName: 'Account Name',
    primaryEmail: 'Primary Email',
    cards: 'Cards (Comma sep)',
    authorize: 'Authorize Account',
    updateAccount: 'Update Account',
    logFuel: 'Log Fuel Purchase',
    manualEntry: 'Manual ledger entry.',
    clientAccount: 'Client Account',
    date: 'Date',
    time: 'Time (24h)',
    stationEntity: 'Station Entity',
    purchaseCost: 'Purchase Cost / Liter',
    showCost: 'Show purchase price to client',
    commit: 'Commit Transaction',
    updateTransaction: 'Update Transaction',
    inviteMember: 'Invite Team Member',
    grantAccess: 'Grant system access via email.',
    fullName: 'Full Name',
    permissions: 'Permissions',
    confirmInvite: 'Confirm & Invite',
    saveChanges: 'Save Changes',
    allClients: 'All Clients',
    successImport: 'Successfully imported',
    unassigned: 'Unassigned',
    manual: 'Manual',
    address: 'Address',
    member: 'Member',
    email: 'Email',
    role: 'Role',
    actions: 'Actions',
    invalidCard: 'Error: This card is not linked to the selected client.',
    clientUpdated: 'Client information updated.',
    txUpdated: 'Transaction updated.',
    userUpdated: 'User permissions updated.',
    timeFormatHint: 'Use HH:MM format',
    exportExcel: 'Export Excel',
    exportInvoice: 'Export Invoice',
    startDate: 'Start Date',
    endDate: 'End Date',
    resetFilter: 'Reset',
    currency: 'UAH',
    buyPrice: 'Buy Price',
    sellPrice: 'Sell Price',
    permSeeCost: 'See Purchase Cost',
    permManageUsers: 'Add/Edit Users',
    permManageTx: 'Edit/Delete Tx',
    permManageClients: 'Edit/Delete Clients',
    permExport: 'Export Data',
    password: 'Password',
    setPassword: 'Set Password',
    invalidLogin: 'Invalid email or password.',
    switchLanguage: 'Language: English',
    importSuccess: 'Imported successfully!',
    importError: 'Import failed. Check file format.',
    duplicateIdError: 'Error: This Client ID is already in use.',
    duplicateCardError: 'Error: Card "{card}" is already linked to client "{account}".',
    duplicateInternalCardError: 'Error: You have entered duplicate card numbers in the list: "{card}".',
    resetSystem: 'Reset System Data',
    exportBackup: 'Export System Backup',
    importBackup: 'Restore from Backup',
    backupHint: 'Save your entire database as a file for permanent safety.',
    restoreConfirm: 'Warning: This will replace all current data. Proceed?',
    restoreSuccess: 'System restored successfully!',
    languagePref: 'Language Preference',
    systemConfig: 'System Configuration'
  },
  uk: {
    overview: 'Огляд',
    clients: 'Клієнти',
    transactions: 'Транзакції',
    settings: 'Налаштування',
    userManagement: 'Користувачі',
    dataManagement: 'Керування даними',
    search: 'Пошук...',
    importClients: 'Імпорт клієнтів',
    importFuel: 'Імпорт пального',
    newUser: 'Запросити',
    editUser: 'Редагувати',
    newClient: 'Новий клієнт',
    editClient: 'Редагувати клієнта',
    editTransaction: 'Редагувати транзакцію',
    recordFuel: 'Додати пальне',
    totalLiters: 'Всього літрів',
    revenue: 'Очікуваний дохід',
    margin: 'Маржа',
    intelligence: 'AI Аналітика',
    aiDescription: "Інтегрований Gemini AI аналізує споживання для виявлення відхилень.",
    getInsights: 'Отримати аналіз',
    analyzing: 'Аналіз...',
    liveActivity: 'Останні події',
    viewLedger: 'Весь журнал',
    idRef: 'ID',
    identity: 'Клієнт',
    activeCards: 'Картки',
    operations: 'Операції',
    noClients: 'Клієнтів не знайдено',
    logEntry: 'Запис',
    account: 'Рахунок',
    assetCard: 'Картка',
    station: 'АЗС',
    stationAddress: 'Адреса АЗС',
    liters: 'Літри',
    invoiceTotal: 'Всього',
    welcome: 'З поверненням',
    logout: 'Вийти',
    staff: 'Співробітник',
    admin: 'Адміністратор',
    readOnly: 'Доступ обмежено адміністратором.',
    internalId: 'Внутрішній ID',
    marginL: 'Маржа (UAH/Л)',
    accountName: 'Назва',
    primaryEmail: 'Email',
    cards: 'Картки',
    authorize: 'Створити',
    updateAccount: 'Оновити',
    logFuel: 'Реєстрація',
    manualEntry: 'Ручне введення.',
    clientAccount: 'Аккаунт',
    date: 'Дата',
    time: 'Час',
    stationEntity: 'АЗС',
    purchaseCost: 'Ціна закупівлі',
    showCost: 'Показувати ціну клієнту',
    commit: 'Зберегти',
    updateTransaction: 'Оновити',
    inviteMember: 'Запросити',
    grantAccess: 'Надати доступ.',
    fullName: "Ім'я",
    permissions: 'Права доступу',
    confirmInvite: 'Підтвердити',
    saveChanges: 'Зберегти',
    allClients: 'Всі клієнти',
    successImport: 'Імпортовано',
    unassigned: 'Не призначено',
    manual: 'Вручну',
    address: 'Адреса',
    member: 'Користувач',
    email: 'Email',
    role: 'Роль',
    actions: 'Дії',
    invalidCard: 'Помилка картки.',
    clientUpdated: 'Клієнта оновлено.',
    txUpdated: 'Транзакцію оновлено.',
    userUpdated: 'Права оновлено.',
    timeFormatHint: 'Формат ГГ:ХХ',
    exportExcel: 'Excel',
    exportInvoice: 'Інвойс',
    startDate: 'Початок',
    endDate: 'Кінець',
    resetFilter: 'Скинути',
    currency: 'UAH',
    buyPrice: 'Закупівля',
    sellPrice: 'Ціна продажу',
    permSeeCost: 'Бачити закупівлю',
    permManageUsers: 'Додавати користувачів',
    permManageTx: 'Редагувати транзакції',
    permManageClients: 'Редагувати клієнтів',
    permExport: 'Експорт даних',
    password: 'Пароль',
    setPassword: 'Встановити пароль',
    invalidLogin: 'Невірний email або пароль.',
    switchLanguage: 'Мова: Українська',
    importSuccess: 'Імпорт успішний!',
    importError: 'Помилка імпорту. Перевірте формат.',
    duplicateIdError: 'Помилка: Цей ID клієнта вже використовується.',
    duplicateCardError: 'Помилка: Картка "{card}" вже закріплена за клієнтом "{account}".',
    duplicateInternalCardError: 'Помилка: Ви ввели дубльовані номери карток у списку: "{card}".',
    resetSystem: 'Скинути дані системи',
    exportBackup: 'Експорт резервної копії',
    importBackup: 'Відновити з копії',
    backupHint: 'Збережіть усю базу даних у файл для надійності.',
    restoreConfirm: 'Увага: Це замінить усі поточні дані. Продовжити?',
    restoreSuccess: 'Систему відновлено успішно!',
    languagePref: 'Налаштування мови',
    systemConfig: 'Конфігурація системи'
  }
};

const INITIAL_ADMIN: AuthUser = {
  id: 'primary-admin',
  name: 'Andriy Pelypenko',
  email: 'andriy.pelypenko@gmail.com',
  password: 'qazQAZ123!@#',
  role: 'admin',
  photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Andriy`,
  permissions: {
    canSeeCost: true,
    canManageUsers: true,
    canManageTransactions: true,
    canManageClients: true,
    canExport: true
  }
};

const parseNumeric = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = String(val).replace(/[^\d.,-]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

const findValue = (row: any, aliases: string[]): any => {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const target = alias.toLowerCase().replace(/\s/g, '');
    const foundKey = keys.find(k => k.toLowerCase().replace(/\s/g, '') === target);
    if (foundKey !== undefined) {
      return row[foundKey];
    }
  }
  return undefined;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('fueltrack_lang');
    return (saved as Language) || 'en';
  });

  const t = translations[lang];

  // ROBUST STATE INITIALIZATION FROM LOCALSTORAGE
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('fueltrack_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<FuelTransaction[]>(() => {
    const saved = localStorage.getItem('fueltrack_tx');
    return saved ? JSON.parse(saved) : [];
  });

  const [authorizedUsers, setAuthorizedUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('fueltrack_auth_users');
    let list: AuthUser[] = saved ? JSON.parse(saved) : [];
    // Always ensure primary admin exists and is up to date
    const adminIdx = list.findIndex(u => u.email.toLowerCase() === INITIAL_ADMIN.email.toLowerCase());
    if (adminIdx === -1) {
      list = [INITIAL_ADMIN, ...list];
    } else {
      list[adminIdx] = { ...INITIAL_ADMIN, ...list[adminIdx], password: INITIAL_ADMIN.password, role: 'admin' };
    }
    return list;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('fueltrack_user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Re-verify against live users list
    const savedUsers = localStorage.getItem('fueltrack_auth_users');
    const usersList: AuthUser[] = savedUsers ? JSON.parse(savedUsers) : [INITIAL_ADMIN];
    return usersList.find(u => u.email.toLowerCase() === parsed.email.toLowerCase()) || null;
  });

  // SAVING EFFECTS
  useEffect(() => localStorage.setItem('fueltrack_lang', lang), [lang]);
  useEffect(() => localStorage.setItem('fueltrack_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('fueltrack_tx', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('fueltrack_auth_users', JSON.stringify(authorizedUsers)), [authorizedUsers]);
  useEffect(() => {
    if (user) localStorage.setItem('fueltrack_user', JSON.stringify(user));
    else localStorage.removeItem('fueltrack_user');
  }, [user]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginFailedCount, setLoginFailedCount] = useState(0);

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FuelTransaction | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [txError, setTxError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const [modalSelectedClientId, setModalSelectedClientId] = useState<string>('');

  const clientFileRef = useRef<HTMLInputElement>(null);
  const fuelFileRef = useRef<HTMLInputElement>(null);
  const backupFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTransaction) {
      setModalSelectedClientId(editingTransaction.clientId);
    } else if (isAddingTransaction) {
      setModalSelectedClientId(clients[0]?.id || 'unassigned');
    }
  }, [editingTransaction, isAddingTransaction, clients]);

  const hasPermission = (key: keyof UserPermissions) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return !!user.permissions[key];
  };

  const handleExportBackup = () => {
    const fullState = {
      clients,
      transactions,
      authorizedUsers,
      exportDate: new Date().toISOString(),
      version: '2.6'
    };
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FuelTrack_Full_Backup_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowToast("Backup exported.");
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.clients || !data.transactions) {
          throw new Error("Invalid backup format.");
        }

        if (confirm(t.restoreConfirm)) {
          setClients(data.clients);
          setTransactions(data.transactions);
          if (data.authorizedUsers) setAuthorizedUsers(data.authorizedUsers);
          setShowToast(t.restoreSuccess);
          setTimeout(() => setShowToast(null), 3000);
        }
      } catch (err) {
        alert("Import failed: " + (err instanceof Error ? err.message : "Invalid JSON"));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSystem = () => {
    if (confirm("This will clear ALL clients, transactions, and additional users. Only the primary admin will remain. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    setTimeout(() => {
      const cleanEmail = loginEmail.trim().toLowerCase();
      const cleanPass = loginPassword.trim();

      const match = authorizedUsers.find(u => 
        u.email.toLowerCase() === cleanEmail && 
        u.password === cleanPass
      );

      if (match) {
        setUser(match);
        setLoginFailedCount(0);
        setShowToast(`${t.welcome}, ${match.name}`);
        setTimeout(() => setShowToast(null), 3000);
      } else {
        setLoginFailedCount(prev => prev + 1);
        alert(t.invalidLogin);
      }
      setIsLoggingIn(false);
    }, 400);
  };

  const handleLogout = () => {
    setUser(null);
    setLoginPassword('');
  };

  const canManageUsers = hasPermission('canManageUsers');
  const canSeeCost = hasPermission('canSeeCost');
  const canManageTransactions = hasPermission('canManageTransactions');
  const canManageClients = hasPermission('canManageClients');
  const canExport = hasPermission('canExport');

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageUsers) return;
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as Role;
    const name = formData.get('name') as string;
    const email = (formData.get('email') as string).trim().toLowerCase();
    const password = (formData.get('password') as string).trim();

    const perms: UserPermissions = {
      canSeeCost: formData.get('canSeeCost') === 'on',
      canManageUsers: formData.get('canManageUsers') === 'on',
      canManageTransactions: formData.get('canManageTransactions') === 'on',
      canManageClients: formData.get('canManageClients') === 'on',
      canExport: formData.get('canExport') === 'on',
    };

    if (editingUser) {
      setAuthorizedUsers(authorizedUsers.map(u => u.id === editingUser.id ? { ...u, name, email, role, password, permissions: perms } : u));
      setEditingUser(null);
      setShowToast(t.userUpdated);
    } else {
      const newUser: AuthUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        role,
        permissions: perms,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      };
      setAuthorizedUsers([...authorizedUsers, newUser]);
      setIsAddingUser(false);
      setShowToast("User added.");
    }
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleDeleteUser = (id: string) => {
    if (id === user?.id) return;
    setAuthorizedUsers(authorizedUsers.filter(u => u.id !== id));
  };

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageClients) return;
    const formData = new FormData(e.currentTarget);
    const uniqueId = (formData.get('uniqueId') as string).trim();
    const cardsInput = formData.get('cards') as string;
    const newCards = cardsInput.split(',').map(c => c.trim()).filter(c => c);

    const duplicateIdClient = clients.find(c => c.uniqueId === uniqueId && c.id !== editingClient?.id);
    if (duplicateIdClient) {
      setClientError(t.duplicateIdError);
      return;
    }

    const uniqueEnteredCards = new Set<string>();
    for (const card of newCards) {
      if (uniqueEnteredCards.has(card)) {
        setClientError(t.duplicateInternalCardError.replace('{card}', card));
        return;
      }
      uniqueEnteredCards.add(card);
    }

    for (const card of newCards) {
      const conflictingClient = clients.find(c => c.id !== editingClient?.id && c.fuelCardNumbers.includes(card));
      if (conflictingClient) {
        setClientError(t.duplicateCardError.replace('{card}', card).replace('{account}', conflictingClient.name));
        return;
      }
    }

    const newClient: Client = {
      id: editingClient?.id || crypto.randomUUID(),
      uniqueId: uniqueId,
      name: formData.get('name') as string,
      email: (formData.get('email') as string).trim(),
      fuelCardNumbers: newCards,
      marginPerLiter: parseFloat(formData.get('margin') as string || '0'),
    };
    
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? newClient : c));
      setEditingClient(null);
      setShowToast(t.clientUpdated);
    } else {
      setClients([...clients, newClient]);
      setIsAddingClient(false);
      setShowToast("Client onboarded.");
    }
    setClientError(null);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleImportClients = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const newClients: Client[] = data.map(row => {
          const cardsStr = String(findValue(row, ['Cards', 'fuelCardNumbers', 'fuelCards', 'Cards List']) || '');
          return {
            id: crypto.randomUUID(),
            uniqueId: String(findValue(row, ['ID', 'uniqueId', 'Internal ID', 'Code']) || '').trim(),
            name: String(findValue(row, ['Name', 'Client Name', 'Account']) || '').trim(),
            email: String(findValue(row, ['Email', 'Primary Email']) || '').trim(),
            fuelCardNumbers: cardsStr.split(',').map((c: string) => c.trim()).filter(c => c),
            marginPerLiter: parseNumeric(findValue(row, ['Margin', 'marginPerLiter', 'Markup'])),
          };
        });

        setClients([...clients, ...newClients]);
        setShowToast(t.importSuccess);
        setTimeout(() => setShowToast(null), 3000);
      } catch (err) {
        alert(t.importError);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleImportFuel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const newTx: FuelTransaction[] = data.map(row => {
          const card = String(findValue(row, ['Card', 'fuelCardNumber', 'Asset Card', 'Card Number']) || '').trim();
          const matchedClient = clients.find(c => c.fuelCardNumbers.includes(card));
          
          const costVal = findValue(row, ['Cost', 'Cost Per Liter', 'Price', 'Price/L', 'Rate', 'Purchase Cost', 'Unit Cost', 'Ціна', 'Вартість', 'Закупівля', 'Закуп']);
          const literVal = findValue(row, ['Liters', 'Volume', 'Quantity', 'Qty', 'Amount', 'Літри', 'Кількість']);
          const dateVal = findValue(row, ['Date', 'Transaction Date', 'Date Of Purchase', 'Дата']);
          const timeVal = findValue(row, ['Time', 'Transaction Time', 'Час']);
          const fuelTypeVal = findValue(row, ['FuelType', 'Type', 'Fuel Grade', 'Grade', 'Вид']);
          const stationVal = findValue(row, ['Station', 'Station Name', 'Merchant', 'Vendor', 'АЗС', 'Станція']);
          const addressVal = findValue(row, ['Address', 'Station Address', 'Location', 'Адреса']);

          return {
            id: crypto.randomUUID(),
            clientId: matchedClient?.id || 'unassigned',
            fuelCardNumber: card,
            date: String(dateVal || format(new Date(), 'yyyy-MM-dd')),
            time: String(timeVal || '12:00'),
            fuelType: String(fuelTypeVal || 'Diesel'),
            stationName: String(stationVal || 'Unknown'),
            stationAddress: String(addressVal || ''),
            liters: parseNumeric(literVal),
            costPerLiter: parseNumeric(costVal),
            showCostToClient: true,
          };
        });

        setTransactions([...transactions, ...newTx]);
        setShowToast(t.importSuccess);
        setTimeout(() => setShowToast(null), 3000);
      } catch (err) {
        alert(t.importError);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const stats = useMemo(() => {
    const totalLiters = transactions.reduce((acc, t) => acc + t.liters, 0);
    const totalRevenue = transactions.reduce((acc, t) => {
      const client = clients.find(c => c.id === t.clientId);
      return acc + (t.liters * (t.costPerLiter + (client?.marginPerLiter || 0)));
    }, 0);
    const totalMargin = transactions.reduce((acc, t) => {
      const client = clients.find(c => c.id === t.clientId);
      return acc + (t.liters * (client?.marginPerLiter || 0));
    }, 0);
    return { totalLiters, totalRevenue, totalMargin };
  }, [transactions, clients]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const clientMatches = selectedClientId === 'all' || tx.clientId === selectedClientId;
      const searchMatches = 
        tx.fuelCardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.stationAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clients.find(c => c.id === tx.clientId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      let dateMatches = true;
      if (startDate || endDate) {
        const txDate = startOfDay(parseISO(tx.date));
        const start = startDate ? startOfDay(parseISO(startDate)) : startOfDay(new Date(1970, 0, 1));
        const end = endDate ? endOfDay(parseISO(endDate)) : endOfDay(new Date(2100, 0, 1));
        dateMatches = isWithinInterval(txDate, { start, end });
      }
      return clientMatches && searchMatches && dateMatches;
    }).sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
  }, [transactions, selectedClientId, searchTerm, startDate, endDate, clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleExportExcel = () => {
    if (!canExport) return;
    const exportData = filteredTransactions.map(tx => {
      const client = clients.find(c => c.id === tx.clientId);
      const sellPrice = tx.costPerLiter + (client?.marginPerLiter || 0);
      return {
        'Date': tx.date,
        'Time': tx.time,
        'Client': client?.name || 'Manual',
        'Card': tx.fuelCardNumber,
        'Station': tx.stationName,
        'Address': tx.stationAddress,
        'Liters': tx.liters,
        ...(canSeeCost ? { 'Buy Price (UAH)': tx.costPerLiter } : {}),
        'Sell Price (UAH)': sellPrice,
        'Total (UAH)': (tx.liters * sellPrice).toFixed(2)
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `Fuel_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleSaveTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageTransactions) return;
    const formData = new FormData(e.currentTarget);
    const clientId = formData.get('clientId') as string;
    const fuelCardNumber = (formData.get('fuelCardNumber') as string).trim();
    
    const selectedClient = clients.find(c => c.id === clientId);
    if (clientId !== 'unassigned' && selectedClient && !selectedClient.fuelCardNumbers.includes(fuelCardNumber)) {
        setTxError(t.invalidCard);
        return;
    }

    const txData = {
      clientId,
      fuelCardNumber,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      fuelType: formData.get('fuelType') as string || 'Diesel',
      stationName: formData.get('stationName') as string,
      stationAddress: formData.get('stationAddress') as string,
      liters: parseFloat(formData.get('liters') as string),
      costPerLiter: parseFloat(formData.get('costPerLiter') as string),
      showCostToClient: formData.get('showCost') === 'on',
    };

    if (editingTransaction) {
      setTransactions(transactions.map(tx => tx.id === editingTransaction.id ? { ...tx, ...txData } : tx));
      setEditingTransaction(null);
      setShowToast(t.txUpdated);
    } else {
      setTransactions([...transactions, { id: crypto.randomUUID(), ...txData }]);
      setIsAddingTransaction(false);
      setShowToast("Transaction recorded.");
    }
    setTxError(null);
    setTimeout(() => setShowToast(null), 3000);
  };

  const currentClientCards = useMemo(() => {
    const matched = clients.find(c => c.id === modalSelectedClientId);
    return matched ? matched.fuelCardNumbers : [];
  }, [modalSelectedClientId, clients]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="flex flex-col items-center gap-4">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20"><Fuel className="w-8 h-8 text-white" /></div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">FuelTrack Pro</h1>
              <p className="text-slate-400 text-center font-medium">Enterprise fuel management & analytics dashboard.</p>
           </div>
           
           <form onSubmit={handleGoogleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">{t.primaryEmail}</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                     type="email" 
                     required 
                     value={loginEmail}
                     onChange={(e) => setLoginEmail(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                     placeholder="name@company.com"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">{t.password}</label>
                <div className="relative">
                   <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                     type={showPassword ? "text" : "password"} 
                     required 
                     minLength={1}
                     maxLength={100}
                     value={loginPassword}
                     onChange={(e) => setLoginPassword(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                     placeholder="••••••••"
                   />
                   <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                   >
                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-blue-400" />}
                {isLoggingIn ? 'Verifying...' : 'Access Dashboard'}
              </button>

              {loginFailedCount > 0 && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col gap-3">
                     <p className="text-xs text-red-700 font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Credentials Hint:
                     </p>
                     <p className="text-[10px] text-red-600 font-mono leading-relaxed">
                        Email: andriy.pelypenko@gmail.com<br/>
                        Password: qazQAZ123!@#
                     </p>
                     <button 
                       type="button"
                       onClick={handleResetSystem}
                       className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors mt-2"
                     >
                        <RotateCcw className="w-3 h-3" /> {t.resetSystem}
                     </button>
                   </div>
                </div>
              )}
           </form>

           <div className="pt-6 border-t border-slate-100 flex justify-center items-center">
             <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">v2.6 Enterprise</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <input type="file" ref={clientFileRef} className="hidden" accept=".xlsx,.xls" onChange={handleImportClients} />
      <input type="file" ref={fuelFileRef} className="hidden" accept=".xlsx,.xls" onChange={handleImportFuel} />
      <input type="file" ref={backupFileRef} className="hidden" accept=".json" onChange={handleImportBackup} />

      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right duration-300">
           <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">{showToast}</span>
           </div>
        </div>
      )}

      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 overflow-y-auto grow">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg"><Fuel className="w-6 h-6" /></div>
            <h1 className="text-xl font-bold tracking-tight">FuelTrack Pro</h1>
          </div>
          <nav className="space-y-6">
            <div className="space-y-2">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: t.overview },
                { id: 'clients', icon: Users, label: t.clients },
                { id: 'transactions', icon: FileText, label: t.transactions },
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveView(item.id as ViewType)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                {t.settings}
              </p>
              {canManageUsers && (
                <button onClick={() => setActiveView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <UserPlus className="w-5 h-5" />
                  <span className="font-medium">{t.userManagement}</span>
                </button>
              )}
              {user?.role === 'admin' && (
                <button onClick={() => setActiveView('data')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'data' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <Database className="w-5 h-5" />
                  <span className="font-medium">{t.dataManagement}</span>
                </button>
              )}
              <button onClick={() => setActiveView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <SettingsIcon className="w-5 h-5" />
                <span className="font-medium">{t.settings}</span>
              </button>
            </div>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800 space-y-4 shrink-0">
           <div className="flex items-center gap-3 px-2">
             <img src={user.photoUrl} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="Avatar" />
             <div className="flex flex-col min-w-0">
               <span className="text-sm font-bold truncate">{user.name}</span>
               <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">{user.role}</span>
             </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-bold">
             <LogOut className="w-4 h-4" />{t.logout}
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">{(t as any)[activeView]}</h2>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {activeView !== 'settings' && activeView !== 'data' && (
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={t.search} 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              {activeView === 'transactions' && (
                <div className="flex gap-2">
                  {canExport && (
                    <>
                      <button onClick={handleExportExcel} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200 text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition-colors"><FileSpreadsheet className="w-4 h-4" /> {t.exportExcel}</button>
                      <button onClick={() => downloadConsolidatedInvoice(filteredTransactions, clients)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors"><Download className="w-4 h-4" /> {t.exportInvoice}</button>
                    </>
                  )}
                  {canManageTransactions && (
                    <>
                      <button onClick={() => fuelFileRef.current?.click()} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"><Upload className="w-4 h-4" /> {t.importFuel}</button>
                      <button onClick={() => setIsAddingTransaction(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" /> {t.recordFuel}</button>
                    </>
                  )}
                </div>
              )}
              {activeView === 'clients' && canManageClients && (
                <div className="flex gap-2">
                  <button onClick={() => clientFileRef.current?.click()} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"><Upload className="w-4 h-4" /> {t.importClients}</button>
                  <button onClick={() => setIsAddingClient(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" /> {t.newClient}</button>
                </div>
              )}
              {activeView === 'users' && canManageUsers && (
                <button onClick={() => setIsAddingUser(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"><UserPlus className="w-4 h-4" /> {t.newUser}</button>
              )}
            </div>
          </div>

          {activeView === 'transactions' && (
            <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-xl mt-4 border border-slate-100">
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.account}</span>
                 <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                    <option value="all">{t.allClients}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                 <span className="text-slate-300">→</span>
                 <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                 {(startDate || endDate) && <button onClick={() => { setStartDate(''); setEndDate(''); }} className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"><XCircle className="w-4 h-4" /></button>}
               </div>
            </div>
          )}
        </header>

        <div className="p-8 space-y-8">
          {activeView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: t.totalLiters, value: stats.totalLiters.toLocaleString() + ' L', icon: Fuel, color: 'text-blue-600' },
                { label: t.revenue, value: stats.totalRevenue.toLocaleString() + ' ' + t.currency, icon: TrendingUp, color: 'text-emerald-600' },
                { label: t.margin, value: stats.totalMargin.toLocaleString() + ' ' + t.currency, icon: CreditCard, color: 'text-amber-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className={`p-4 rounded-xl bg-slate-50`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{s.label}</p>
                    <p className="text-2xl font-black text-slate-800">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'clients' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.idRef}</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.identity}</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.activeCards}</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.marginL}</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">{t.noClients}</td>
                    </tr>
                  ) : (
                    filteredClients.map(client => (
                      <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-500 text-xs">{client.uniqueId}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{client.name}</span>
                            <span className="text-xs text-slate-400">{client.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {client.fuelCardNumbers.map(card => (
                              <span key={card} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100">{card}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">{client.marginPerLiter.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          {canManageClients && (
                            <div className="flex justify-end gap-2">
                               <button onClick={() => setEditingClient(client)} className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                               <button onClick={() => setClients(clients.filter(c => c.id !== client.id))} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeView === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Member</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authorizedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.photoUrl} className="w-8 h-8 rounded-full border border-slate-200" alt="" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{u.name}</span>
                            <span className="text-xs text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                           <button disabled={u.id === user?.id || u.id === 'primary-admin'} onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="max-w-4xl space-y-8">
              {/* Language Settings */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-2xl"><Languages className="w-6 h-6 text-blue-600" /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{t.languagePref}</h3>
                    <p className="text-sm text-slate-500 font-medium">Configure your primary dashboard language.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setLang('en')}
                    className={`flex-1 px-6 py-4 rounded-2xl font-black transition-all border ${lang === 'en' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setLang('uk')}
                    className={`flex-1 px-6 py-4 rounded-2xl font-black transition-all border ${lang === 'uk' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    Українська
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'data' && user?.role === 'admin' && (
            <div className="max-w-4xl space-y-8">
              {/* Data Management Section */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-2xl"><Database className="w-6 h-6 text-indigo-600" /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{t.dataManagement}</h3>
                    <p className="text-sm text-slate-500 font-medium">{t.backupHint}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={handleExportBackup}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
                  >
                    <Save className="w-5 h-5" />
                    {t.exportBackup}
                  </button>
                  <button 
                    onClick={() => backupFileRef.current?.click()}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <UploadCloud className="w-5 h-5" />
                    {t.importBackup}
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <AlertCircle className="w-4 h-4 text-red-500" />
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.systemConfig}</span>
                     </div>
                  </div>
                  <button 
                    onClick={handleResetSystem}
                    className="flex items-center justify-between px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-5 h-5" />
                      <span>{t.resetSystem}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'transactions' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
               <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Log</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Account</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Liters</th>
                      {canSeeCost && <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Buy</th>}
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Sell</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={canSeeCost ? 7 : 6} className="px-6 py-12 text-center text-slate-400 font-medium">No transactions match filters</td>
                      </tr>
                    ) : (
                      filteredTransactions.map(tx => {
                        const client = clients.find(c => c.id === tx.clientId);
                        const sellPrice = tx.costPerLiter + (client?.marginPerLiter || 0);
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold">{tx.date} <br/> <span className="text-slate-400 font-medium">{tx.time}</span></td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-blue-600">{client?.name || 'Manual'}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{tx.fuelCardNumber}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-black">{tx.liters.toFixed(2)}</td>
                            {canSeeCost && <td className="px-6 py-4 text-right text-xs text-slate-400">{tx.costPerLiter.toFixed(2)}</td>}
                            <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">{sellPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-black">{(tx.liters * sellPrice).toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                               {canManageTransactions && (
                                 <div className="flex justify-end gap-1">
                                   <button onClick={() => setEditingTransaction(tx)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                                   <button onClick={() => setTransactions(transactions.filter(t => t.id !== tx.id))} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                               )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      </main>

      {/* Client Add/Edit Modal */}
      {(isAddingClient || editingClient) && canManageClients && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingClient ? t.editClient : t.newClient}</h3>
              <button onClick={() => { setIsAddingClient(false); setEditingClient(null); setClientError(null); }} className="text-slate-400 text-2xl hover:text-slate-600 transition-colors">&times;</button>
            </div>
            {clientError && <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-100 animate-in shake duration-300"><AlertCircle className="w-4 h-4"/>{clientError}</div>}
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.internalId}</label>
                  <input name="uniqueId" required defaultValue={editingClient?.uniqueId} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.marginL}</label>
                  <input name="margin" type="number" step="0.01" defaultValue={editingClient?.marginPerLiter} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.accountName}</label>
                <input name="name" required defaultValue={editingClient?.name} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.primaryEmail}</label>
                <input name="email" type="email" required defaultValue={editingClient?.email} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.cards}</label>
                <textarea name="cards" required defaultValue={editingClient?.fuelCardNumbers.join(', ')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[80px] focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CARD-1, CARD-2"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black mt-4 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">{editingClient ? t.saveChanges : t.authorize}</button>
            </form>
          </div>
        </div>
      )}

      {/* User Add/Edit Modal */}
      {(isAddingUser || editingUser) && canManageUsers && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingUser ? t.editUser : t.newUser}</h3>
              <button onClick={() => { setIsAddingUser(false); setEditingUser(null); }} className="text-slate-400 text-2xl hover:text-slate-600 transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.fullName}</label>
                <input required name="name" defaultValue={editingUser?.name} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.primaryEmail}</label>
                <input required name="email" type="email" defaultValue={editingUser?.email} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.setPassword}</label>
                <input required name="password" type="text" minLength={1} maxLength={100} defaultValue={editingUser?.password} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.role}</label>
                <select name="role" defaultValue={editingUser?.role || 'user'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                  <option value="user">{t.staff}</option>
                  <option value="admin">{t.admin}</option>
                </select>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-3">
                 <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest"><Lock className="w-3 h-3" /> {t.permissions}</p>
                 <div className="grid grid-cols-2 gap-2">
                   {[
                     { id: 'canSeeCost', label: t.permSeeCost },
                     { id: 'canManageUsers', label: t.permManageUsers },
                     { id: 'canManageTransactions', label: t.permManageTx },
                     { id: 'canManageClients', label: t.permManageClients },
                     { id: 'canExport', label: t.permExport },
                   ].map(p => (
                     <label key={p.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                       <input type="checkbox" name={p.id} defaultChecked={editingUser ? (editingUser.permissions as any)[p.id] : false} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                       <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{p.label}</span>
                     </label>
                   ))}
                 </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black mt-4 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">{editingUser ? t.saveChanges : t.confirmInvite}</button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal (Log Fuel Purchase) */}
      {(isAddingTransaction || editingTransaction) && canManageTransactions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingTransaction ? t.editTransaction : t.logFuel}</h3>
              <button onClick={() => { setIsAddingTransaction(false); setEditingTransaction(null); setTxError(null); }} className="text-slate-400 text-2xl hover:text-slate-600 transition-colors">&times;</button>
            </div>
            {txError && <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-100"><AlertCircle className="w-4 h-4"/>{txError}</div>}
            <form onSubmit={handleSaveTransaction} className="grid grid-cols-2 gap-4">
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.account}</label>
                <select 
                  name="clientId" 
                  required 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                  value={modalSelectedClientId}
                  onChange={(e) => setModalSelectedClientId(e.target.value)}
                >
                  <option value="unassigned">Unassigned</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.assetCard}</label>
                <select 
                  name="fuelCardNumber" 
                  required 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  defaultValue={editingTransaction?.fuelCardNumber}
                >
                  <option value="">Select Card</option>
                  {currentClientCards.map(card => (
                    <option key={card} value={card}>{card}</option>
                  ))}
                  {modalSelectedClientId === 'unassigned' && (
                    <option value="MANUAL">Manual Card</option>
                  )}
                </select>
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.date}</label>
                <input type="date" name="date" required defaultValue={editingTransaction?.date || format(new Date(), 'yyyy-MM-dd')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.time}</label>
                <input name="time" required defaultValue={editingTransaction?.time || format(new Date(), 'HH:mm')} placeholder="HH:MM" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.stationEntity}</label>
                <input name="stationName" required defaultValue={editingTransaction?.stationName} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.stationAddress}</label>
                <input name="stationAddress" required defaultValue={editingTransaction?.stationAddress} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.liters}</label>
                <input type="number" step="0.01" name="liters" required defaultValue={editingTransaction?.liters} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.purchaseCost}</label>
                <input type="number" step="0.01" name="costPerLiter" required defaultValue={editingTransaction?.costPerLiter} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-2">
                <input type="checkbox" name="showCost" id="showCost" defaultChecked={editingTransaction?.showCostToClient ?? true} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <label htmlFor="showCost" className="text-xs font-bold text-slate-600">{t.showCost}</label>
              </div>
              <button type="submit" className="col-span-2 bg-blue-600 text-white py-3 rounded-2xl font-black mt-4 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">{t.commit}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;