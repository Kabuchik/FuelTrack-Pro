
import React, { useState, useEffect, useMemo } from 'react';
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
  Settings,
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
  EyeOff
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
    userManagement: 'User Management',
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
    stationAddress: 'Station Address',
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
    permExport: 'Export Data'
  },
  uk: {
    overview: 'Огляд',
    clients: 'Клієнти',
    transactions: 'Транзакції',
    userManagement: 'Користувачі',
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
    stationAddress: 'Адреса',
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
    permExport: 'Експорт даних'
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('fueltrack_lang');
    return (saved as Language) || 'en';
  });

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('fueltrack_lang', lang);
  }, [lang]);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthUser[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
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
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const [txModalClientId, setTxModalClientId] = useState<string>('');
  const [txError, setTxError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('fueltrack_user');
    const savedClients = localStorage.getItem('fueltrack_clients');
    const savedTx = localStorage.getItem('fueltrack_tx');
    const savedAuthUsers = localStorage.getItem('fueltrack_auth_users');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedTx) setTransactions(JSON.parse(savedTx));
    
    if (savedAuthUsers) {
      setAuthorizedUsers(JSON.parse(savedAuthUsers));
    } else {
      const initialAdmin: AuthUser = {
        id: 'primary-admin',
        name: 'Andriy Pelypenko',
        email: 'andriy.pelypenko@gmail.com',
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
      setAuthorizedUsers([initialAdmin]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const currentLatest = authorizedUsers.find(u => u.id === user.id);
      if (currentLatest) {
        localStorage.setItem('fueltrack_user', JSON.stringify(currentLatest));
      }
    } else {
      localStorage.removeItem('fueltrack_user');
    }
  }, [user, authorizedUsers]);

  useEffect(() => localStorage.setItem('fueltrack_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('fueltrack_tx', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('fueltrack_auth_users', JSON.stringify(authorizedUsers)), [authorizedUsers]);

  // Permission Helpers
  const hasPermission = (key: keyof UserPermissions) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return !!user.permissions[key];
  };

  const canManageUsers = hasPermission('canManageUsers');
  const canSeeCost = hasPermission('canSeeCost');
  const canManageTransactions = hasPermission('canManageTransactions');
  const canManageClients = hasPermission('canManageClients');
  const canExport = hasPermission('canExport');

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      const match = authorizedUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
      if (match) {
        setUser(match);
        setShowToast(`${t.welcome}, ${match.name}`);
        setTimeout(() => setShowToast(null), 5000);
      } else {
        alert(lang === 'en' ? "Email not authorized." : "Email не авторизовано.");
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  // Fixed missing handleLogout function
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fueltrack_user');
  };

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageUsers) return;
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as Role;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    const perms: UserPermissions = {
      canSeeCost: formData.get('canSeeCost') === 'on',
      canManageUsers: formData.get('canManageUsers') === 'on',
      canManageTransactions: formData.get('canManageTransactions') === 'on',
      canManageClients: formData.get('canManageClients') === 'on',
      canExport: formData.get('canExport') === 'on',
    };

    if (editingUser) {
      setAuthorizedUsers(authorizedUsers.map(u => u.id === editingUser.id ? { ...u, name, email, role, permissions: perms } : u));
      setEditingUser(null);
      setShowToast(t.userUpdated);
    } else {
      const newUser: AuthUser = {
        id: crypto.randomUUID(),
        name,
        email,
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
      const searchMatches = tx.fuelCardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.stationName.toLowerCase().includes(searchTerm.toLowerCase());
      let dateMatches = true;
      if (startDate || endDate) {
        const txDate = parseISO(tx.date);
        const start = startDate ? parseISO(startDate) : new Date(1970, 0, 1);
        const end = endDate ? parseISO(endDate) : new Date(2100, 0, 1);
        dateMatches = isWithinInterval(txDate, { start: startOfDay(start), end: endOfDay(end) });
      }
      return clientMatches && searchMatches && dateMatches;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedClientId, searchTerm, startDate, endDate]);

  const handleExportExcel = () => {
    if (!canExport) return;
    const exportData = filteredTransactions.map(tx => {
      const client = clients.find(c => c.id === tx.clientId);
      const sellPrice = tx.costPerLiter + (client?.marginPerLiter || 0);
      return {
        'Date': tx.date,
        'Client': client?.name || 'Manual',
        'Card': tx.fuelCardNumber,
        'Station': tx.stationName,
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
    const fuelCardNumber = formData.get('fuelCardNumber') as string;
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient && !selectedClient.fuelCardNumbers.includes(fuelCardNumber)) {
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
    } else {
      setTransactions([...transactions, { id: crypto.randomUUID(), ...txData }]);
      setIsAddingTransaction(false);
    }
    setTxError(null);
  };

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageClients) return;
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: crypto.randomUUID(),
      uniqueId: formData.get('uniqueId') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      fuelCardNumbers: (formData.get('cards') as string).split(',').map(c => c.trim()),
      marginPerLiter: parseFloat(formData.get('margin') as string || '0'),
    };
    setClients([...clients, newClient]);
    setIsAddingClient(false);
  };

  // Logic to handle login/unauthorized state and prevent crashes when user is null
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="flex flex-col items-center gap-4">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20"><Fuel className="w-8 h-8 text-white" /></div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">FuelTrack Pro</h1>
              <p className="text-slate-400 text-center font-medium">Enterprise fuel management & analytics dashboard.</p>
           </div>
           
           <form onSubmit={handleGoogleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Email Authorization</label>
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
              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-blue-400" />}
                {isLoggingIn ? 'Verifying...' : 'Access Dashboard'}
              </button>
           </form>

           <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
             <button onClick={() => setLang(lang === 'en' ? 'uk' : 'en')} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                <Languages className="w-4 h-4" /> {lang === 'en' ? 'UKRAINIAN' : 'ENGLISH'}
             </button>
             <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">v2.5 Enterprise</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right duration-300">
           <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">{showToast}</span>
           </div>
        </div>
      )}

      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg"><Fuel className="w-6 h-6" /></div>
            <h1 className="text-xl font-bold tracking-tight">FuelTrack Pro</h1>
          </div>
          <nav className="space-y-2">
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
            {canManageUsers && (
               <button onClick={() => setActiveView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Settings className="w-5 h-5" />
                <span className="font-medium">{t.userManagement}</span>
              </button>
            )}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800 space-y-4">
           <div className="flex items-center gap-3 px-2">
             <img src={user.photoUrl} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="Avatar" />
             <div className="flex flex-col min-w-0">
               <span className="text-sm font-bold truncate">{user.name}</span>
               <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">{user.role}</span>
             </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm">
             <LogOut className="w-4 h-4" />{t.logout}
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">{activeView === 'users' ? t.userManagement : (t as any)[activeView]}</h2>
            <div className="flex items-center gap-3">
              {activeView === 'transactions' && (
                <div className="flex gap-2">
                  {canExport && (
                    <>
                      <button onClick={handleExportExcel} className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200 text-sm font-bold flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> {t.exportExcel}</button>
                      <button onClick={() => downloadConsolidatedInvoice(filteredTransactions, clients)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 text-sm font-bold flex items-center gap-2"><Download className="w-4 h-4" /> {t.exportInvoice}</button>
                    </>
                  )}
                  {canManageTransactions && (
                    <button onClick={() => setIsAddingTransaction(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"><Plus className="w-4 h-4" /> {t.recordFuel}</button>
                  )}
                </div>
              )}
              {activeView === 'clients' && canManageClients && (
                <button onClick={() => setIsAddingClient(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"><Plus className="w-4 h-4" /> {t.newClient}</button>
              )}
              {activeView === 'users' && canManageUsers && (
                <button onClick={() => setIsAddingUser(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"><UserPlus className="w-4 h-4" /> {t.newUser}</button>
              )}
            </div>
          </div>

          {activeView === 'transactions' && (
            <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-xl">
               <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-slate-400 uppercase">{t.account}</span>
                 <select className="bg-white border rounded px-2 py-1 text-sm font-bold" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                    <option value="all">{t.allClients}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm" />
                 <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm" />
                 {(startDate || endDate) && <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-red-500"><XCircle className="w-4 h-4" /></button>}
               </div>
            </div>
          )}
        </header>

        <div className="p-8">
          {activeView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: t.totalLiters, value: stats.totalLiters.toLocaleString() + ' L', icon: Fuel, color: 'text-blue-600' },
                { label: t.revenue, value: stats.totalRevenue.toLocaleString() + ' ' + t.currency, icon: TrendingUp, color: 'text-emerald-600' },
                { label: t.margin, value: stats.totalMargin.toLocaleString() + ' ' + t.currency, icon: CreditCard, color: 'text-amber-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className={`p-4 rounded-xl bg-slate-50`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-extrabold uppercase">{s.label}</p>
                    <p className="text-2xl font-black text-slate-800">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'users' && canManageUsers && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Member</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {authorizedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.photoUrl} className="w-8 h-8 rounded-full" alt="" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{u.name}</span>
                            <span className="text-xs text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                           <button disabled={u.id === user?.id} onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 disabled:opacity-0"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeView === 'transactions' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
               <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Log</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Account</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-center">Liters</th>
                      {canSeeCost && <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Buy</th>}
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Sell</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Total</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransactions.map(tx => {
                      const client = clients.find(c => c.id === tx.clientId);
                      const sellPrice = tx.costPerLiter + (client?.marginPerLiter || 0);
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-xs font-bold">{tx.date} <br/> <span className="text-slate-400 font-medium">{tx.time}</span></td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">{client?.name || 'Manual'}</td>
                          <td className="px-6 py-4 text-center font-black">{tx.liters.toFixed(2)}</td>
                          {canSeeCost && <td className="px-6 py-4 text-right text-xs text-slate-400">{tx.costPerLiter.toFixed(2)}</td>}
                          <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">{sellPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-black">{(tx.liters * sellPrice).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                             {canManageTransactions && (
                               <div className="flex justify-end gap-1">
                                 <button onClick={() => setEditingTransaction(tx)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><Pencil className="w-4 h-4" /></button>
                                 <button onClick={() => setTransactions(transactions.filter(t => t.id !== tx.id))} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                               </div>
                             )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      </main>

      {/* User Add/Edit Modal */}
      {(isAddingUser || editingUser) && canManageUsers && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingUser ? t.editUser : t.newUser}</h3>
              <button onClick={() => { setIsAddingUser(false); setEditingUser(null); }} className="text-slate-400 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.fullName}</label>
                <input required name="name" defaultValue={editingUser?.name} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.primaryEmail}</label>
                <input required name="email" type="email" defaultValue={editingUser?.email} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.role}</label>
                <select name="role" defaultValue={editingUser?.role || 'user'} className="w-full px-4 py-2 bg-slate-50 border rounded-xl">
                  <option value="user">{t.staff}</option>
                  <option value="admin">{t.admin}</option>
                </select>
              </div>
              <div className="pt-2 border-t space-y-3">
                 <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Lock className="w-3 h-3" /> {t.permissions}</p>
                 {[
                   { id: 'canSeeCost', label: t.permSeeCost },
                   { id: 'canManageUsers', label: t.permManageUsers },
                   { id: 'canManageTransactions', label: t.permManageTx },
                   { id: 'canManageClients', label: t.permManageClients },
                   { id: 'canExport', label: t.permExport },
                 ].map(p => (
                   <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                     <input type="checkbox" name={p.id} defaultChecked={editingUser ? (editingUser.permissions as any)[p.id] : false} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                     <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{p.label}</span>
                   </label>
                 ))}
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black mt-4">{editingUser ? t.saveChanges : t.confirmInvite}</button>
            </form>
          </div>
        </div>
      )}

      {/* Basic Transaction Modal */}
      {(isAddingTransaction || editingTransaction) && canManageTransactions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingTransaction ? t.editTransaction : t.logFuel}</h3>
              <button onClick={() => { setIsAddingTransaction(false); setEditingTransaction(null); }} className="text-slate-400 text-2xl">&times;</button>
            </div>
            {txError && <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm font-bold"><AlertCircle className="w-4 h-4"/>{txError}</div>}
            <form onSubmit={handleSaveTransaction} className="grid grid-cols-2 gap-4">
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Account</label>
                <select name="clientId" required className="w-full px-4 py-2 bg-slate-50 border rounded-xl" defaultValue={editingTransaction?.clientId}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Card</label>
                <input name="fuelCardNumber" required defaultValue={editingTransaction?.fuelCardNumber} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Date</label>
                <input type="date" name="date" required defaultValue={editingTransaction?.date || format(new Date(), 'yyyy-MM-dd')} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Time</label>
                <input name="time" required defaultValue={editingTransaction?.time || format(new Date(), 'HH:mm')} placeholder="HH:MM" className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Station Name</label>
                <input name="stationName" required defaultValue={editingTransaction?.stationName} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Liters</label>
                <input type="number" step="0.01" name="liters" required defaultValue={editingTransaction?.liters} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Cost/L</label>
                <input type="number" step="0.01" name="costPerLiter" required defaultValue={editingTransaction?.costPerLiter} className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-2">
                <input type="checkbox" name="showCost" id="showCost" defaultChecked={editingTransaction?.showCostToClient ?? true} />
                <label htmlFor="showCost" className="text-sm font-bold text-slate-600">{t.showCost}</label>
              </div>
              <button type="submit" className="col-span-2 bg-blue-600 text-white py-3 rounded-2xl font-black mt-4">{t.commit}</button>
            </form>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {isAddingClient && canManageClients && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">{t.newClient}</h3>
              <button onClick={() => setIsAddingClient(false)} className="text-slate-400 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">{t.internalId}</label>
                  <input name="uniqueId" required className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">{t.marginL}</label>
                  <input name="margin" type="number" step="0.01" className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.accountName}</label>
                <input name="name" required className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.primaryEmail}</label>
                <input name="email" type="email" required className="w-full px-4 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.cards}</label>
                <textarea name="cards" required className="w-full px-4 py-2 bg-slate-50 border rounded-xl min-h-[80px]" placeholder="CARD-1, CARD-2"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black mt-4">{t.authorize}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
