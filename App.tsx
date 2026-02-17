
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
  Filter
} from 'lucide-react';
import { ViewType, Client, FuelTransaction, AuthUser, Role } from './types';
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
    newClient: 'New Client',
    editClient: 'Edit Client',
    editTransaction: 'Edit Transaction',
    recordFuel: 'Record Fuel',
    totalLiters: 'Total Liters',
    revenue: 'Estimated Revenue',
    margin: 'Margin Generated',
    intelligence: 'Intelligence Dashboard',
    aiDescription: "Our integrated Gemini AI analyzes your fleet's fuel consumption to identify irregularities, potential savings, and optimize supply routes.",
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
    readOnly: 'Read-Only Mode: Admin access required for modifications.',
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
    time: 'Time (24h - HH:MM)',
    stationEntity: 'Station Entity',
    purchaseCost: 'Purchase Cost / Liter',
    showCost: 'Show purchase price to client',
    commit: 'Commit Transaction',
    updateTransaction: 'Update Transaction',
    inviteMember: 'Invite Team Member',
    grantAccess: 'Grant system access via email.',
    fullName: 'Full Name',
    permissions: 'System Permissions',
    confirmInvite: 'Confirm & Invite',
    allClients: 'All Clients',
    successImport: 'Successfully imported',
    unassigned: 'Unassigned',
    manual: 'Manual',
    address: 'Physical Address (Optional)',
    member: 'Member',
    email: 'Email',
    role: 'Role',
    actions: 'Actions',
    invalidCard: 'Error: This card is not linked to the selected client.',
    allowedCards: 'Allowed cards for this client:',
    clientUpdated: 'Client information updated successfully.',
    txUpdated: 'Transaction updated successfully.',
    timeFormatHint: 'Use 24h format (e.g., 14:30)',
    exportExcel: 'Export Excel',
    exportInvoice: 'Export Invoice',
    startDate: 'Start Date',
    endDate: 'End Date',
    resetFilter: 'Reset',
    currency: 'UAH',
    buyPrice: 'Buy Price',
    sellPrice: 'Sell Price'
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
    newClient: 'Новий клієнт',
    editClient: 'Редагувати клієнта',
    editTransaction: 'Редагувати транзакцію',
    recordFuel: 'Додати пальне',
    totalLiters: 'Всього літрів',
    revenue: 'Очікуваний дохід',
    margin: 'Маржа',
    intelligence: 'Інтелектуальна панель',
    aiDescription: "Наш інтегрований Gemini AI аналізує споживання пального вашим автопарком для виявлення відхилень, потенційної економії та оптимізації маршрутів.",
    getInsights: 'Отримати аналіз',
    analyzing: 'Аналіз даних...',
    liveActivity: 'Останні події',
    viewLedger: 'Весь журнал',
    idRef: 'ID референс',
    identity: 'Клієнт',
    activeCards: 'Активні картки',
    operations: 'Операції',
    noClients: 'Клієнтів не знайдено',
    logEntry: 'Запис',
    account: 'Рахунок',
    assetCard: 'Картка',
    station: 'АЗС',
    stationAddress: 'Адреса АЗС',
    liters: 'Літри',
    invoiceTotal: 'Всього в інвойсі',
    welcome: 'З поверненням',
    logout: 'Вийти',
    staff: 'Співробітник',
    admin: 'Адміністратор',
    readOnly: 'Режим читання: Тільки адмін може вносити зміни.',
    internalId: 'Внутрішній ID #',
    marginL: 'Маржа (UAH/Л)',
    accountName: 'Назва аккаунту',
    primaryEmail: 'Електронна пошта',
    cards: 'Картки (через кому)',
    authorize: 'Створити аккаунт',
    updateAccount: 'Оновити аккаунт',
    logFuel: 'Реєстрація покупки',
    manualEntry: 'Ручне введення в журнал.',
    clientAccount: 'Аккаунт клієнта',
    date: 'Дата',
    time: 'Час (24г - ГГ:ХХ)',
    stationEntity: 'Назва АЗС',
    purchaseCost: 'Ціна закупівлі / Літр',
    showCost: 'Показувати ціну закупівлі в інвойсі',
    commit: 'Зберегти транзакцію',
    updateTransaction: 'Оновити транзакцію',
    inviteMember: 'Запросити колегу',
    grantAccess: 'Надати доступ через email.',
    fullName: "Повне ім'я",
    permissions: 'Права доступу',
    confirmInvite: 'Підтвердити',
    allClients: 'Всі клієнти',
    successImport: 'Успішно імпортовано',
    unassigned: 'Не призначено',
    manual: 'Вручну',
    address: 'Адреса (опціонально)',
    member: 'Користувач',
    email: 'Email',
    role: 'Роль',
    actions: 'Дії',
    invalidCard: 'Помилка: Ця картка не закріплена за обраним клієнтом.',
    allowedCards: 'Дозволені картки для клієнта:',
    clientUpdated: 'Інформацію про клієнта оновлено.',
    txUpdated: 'Транзакцію оновлено.',
    timeFormatHint: 'Використовуйте 24-год формат (напр., 14:30)',
    exportExcel: 'Експорт Excel',
    exportInvoice: 'Експорт Інвойсу',
    startDate: 'Початок',
    endDate: 'Кінець',
    resetFilter: 'Скинути',
    currency: 'UAH',
    buyPrice: 'Ціна закупівлі',
    sellPrice: 'Ціна клієнта'
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
  
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const [txModalClientId, setTxModalClientId] = useState<string>('');
  const [txError, setTxError] = useState<string | null>(null);

  const [emailingId, setEmailingId] = useState<string | null>(null);
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
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Andriy`
      };
      setAuthorizedUsers([initialAdmin]);
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('fueltrack_user', JSON.stringify(user));
    else localStorage.removeItem('fueltrack_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fueltrack_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('fueltrack_tx', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (authorizedUsers.length > 0) {
      localStorage.setItem('fueltrack_auth_users', JSON.stringify(authorizedUsers));
    }
  }, [authorizedUsers]);

  useEffect(() => {
    if (isAddingTransaction && clients.length > 0 && !txModalClientId) {
      setTxModalClientId(clients[0].id);
    }
    if (editingTransaction) {
      setTxModalClientId(editingTransaction.clientId);
    }
    if (!isAddingTransaction && !editingTransaction) {
      setTxError(null);
      setTxModalClientId('');
    }
  }, [isAddingTransaction, editingTransaction, clients]);

  const isAdmin = user?.role === 'admin';
  const canManageData = user?.role === 'admin' || user?.role === 'user';

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
        alert(lang === 'en' ? "This email is not authorized. Contact an administrator." : "Цей email не авторизовано. Зверніться до адміністратора.");
      }
      setIsLoggingIn(false);
    }, 1200);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveView('dashboard');
  };

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as Role;
    const name = formData.get('name') as string;
    
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      name: name,
      email: formData.get('email') as string,
      role: role,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    
    setAuthorizedUsers([...authorizedUsers, newUser]);
    setIsAddingUser(false);
    setShowToast(`Authorized ${name} as ${role}`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      alert(lang === 'en' ? "You cannot delete yourself." : "Ви не можете видалити себе.");
      return;
    }
    setAuthorizedUsers(authorizedUsers.filter(u => u.id !== userId));
    setShowToast("User access revoked.");
    setTimeout(() => setShowToast(null), 3000);
  };

  const stats = useMemo(() => {
    const totalLiters = transactions.reduce((acc, t) => acc + t.liters, 0);
    const totalRevenue = transactions.reduce((acc, t) => {
      const client = clients.find(c => c.id === t.clientId);
      const pricePerLiter = t.costPerLiter + (client?.marginPerLiter || 0);
      return acc + (t.liters * pricePerLiter);
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
                           tx.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.fuelType.toLowerCase().includes(searchTerm.toLowerCase());
      
      let dateMatches = true;
      if (startDate || endDate) {
        const txDate = parseISO(tx.date);
        const start = startDate ? parseISO(startDate) : new Date(1970, 0, 1);
        const end = endDate ? parseISO(endDate) : new Date(2100, 0, 1);
        dateMatches = isWithinInterval(txDate, { 
          start: startOfDay(start), 
          end: endOfDay(end) 
        });
      }
      return clientMatches && searchMatches && dateMatches;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedClientId, searchTerm, startDate, endDate]);

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageData) return;
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: crypto.randomUUID(),
      uniqueId: formData.get('uniqueId') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string || undefined,
      fuelCardNumbers: (formData.get('cards') as string).split(',').map(c => c.trim()),
      marginPerLiter: parseFloat(formData.get('margin') as string || '0'),
    };
    setClients([...clients, newClient]);
    setIsAddingClient(false);
  };

  const handleUpdateClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin || !editingClient) return;
    const formData = new FormData(e.currentTarget);
    const updatedClient: Client = {
      ...editingClient,
      uniqueId: formData.get('uniqueId') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string || undefined,
      fuelCardNumbers: (formData.get('cards') as string).split(',').map(c => c.trim()),
      marginPerLiter: parseFloat(formData.get('margin') as string || '0'),
    };
    setClients(clients.map(c => c.id === editingClient.id ? updatedClient : c));
    setEditingClient(null);
    setShowToast(t.clientUpdated);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleImportClients = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canManageData) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      const imported = data.map(row => ({
        id: crypto.randomUUID(),
        uniqueId: String(row.ID || row.uniqueId || `CLI-${Math.floor(Math.random() * 10000)}`),
        name: String(row.Name || row.name || 'Unknown Client'),
        email: String(row.Email || row.email || 'no-email@example.com'),
        address: row.Address || row.address || undefined,
        fuelCardNumbers: String(row.Cards || row.cards || '').split(',').map((c: string) => c.trim()).filter(Boolean),
        marginPerLiter: parseFloat(row.Margin || row.margin || '0.10'),
      }));
      setClients([...clients, ...imported]);
      setShowToast(`${t.successImport} ${imported.length} ${t.clients.toLowerCase()}`);
      setTimeout(() => setShowToast(null), 3000);
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageData) return;
    const formData = new FormData(e.currentTarget);
    const clientId = formData.get('clientId') as string;
    const fuelCardNumber = formData.get('fuelCardNumber') as string;
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient && !selectedClient.fuelCardNumbers.includes(fuelCardNumber)) {
        setTxError(t.invalidCard);
        return;
    }
    const txData = {
      clientId: clientId,
      fuelCardNumber: fuelCardNumber,
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
      const newTx: FuelTransaction = {
        id: crypto.randomUUID(),
        ...txData
      };
      setTransactions([...transactions, newTx]);
      setIsAddingTransaction(false);
    }
    setTxError(null);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleImportTransactions = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canManageData) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      const imported = data.map(row => {
        const cardNum = String(row.CardNumber || row.card || '');
        const client = clients.find(c => c.fuelCardNumbers.includes(cardNum));
        return {
          id: crypto.randomUUID(),
          clientId: client?.id || 'unknown',
          fuelCardNumber: cardNum,
          date: row.Date ? format(new Date(row.Date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          time: row.Time || '12:00',
          fuelType: row.FuelType || row.type || 'Diesel',
          stationName: row.Station || row.station_name || 'Generic Station',
          stationAddress: row.Address || row.location || 'Unknown Address',
          liters: parseFloat(row.Liters || row.quantity || '0'),
          costPerLiter: parseFloat(row.Cost || row.price || '0'),
          showCostToClient: true,
        };
      });
      setTransactions([...transactions, ...imported]);
      setShowToast(`${t.successImport} ${imported.length} ${t.transactions.toLowerCase()}`);
      setTimeout(() => setShowToast(null), 3000);
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    const exportData = filteredTransactions.map(tx => {
      const client = clients.find(c => c.id === tx.clientId);
      const pricePerL = tx.costPerLiter + (client?.marginPerLiter || 0);
      return {
        'Date': tx.date,
        'Time': tx.time,
        'Client': client?.name || 'Manual',
        'Card Number': tx.fuelCardNumber,
        'Station': tx.stationName,
        'Address': tx.stationAddress,
        'Fuel Type': tx.fuelType,
        'Liters': tx.liters,
        'Buy Price (UAH)': tx.costPerLiter,
        'Sell Price (UAH)': pricePerL,
        'Total (UAH)': tx.liters * pricePerL
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `FuelTransactions_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  };

  const handleExportConsolidatedInvoice = () => {
    const singleClient = selectedClientId !== 'all' ? clients.find(c => c.id === selectedClientId) : undefined;
    downloadConsolidatedInvoice(filteredTransactions, clients, singleClient);
  };

  const runAiInsights = async () => {
    setIsGeneratingAi(true);
    const insight = await getFuelInsights(filteredTransactions, clients);
    setAiInsight(insight);
    setIsGeneratingAi(false);
  };

  const handleEmailInvoice = async (client: Client) => {
    const clientTx = transactions.filter(t => t.clientId === client.id);
    if (clientTx.length === 0) {
      alert(lang === 'en' ? "No activity for this account." : "Активності за цим аккаунтом не знайдено.");
      return;
    }
    setEmailingId(client.id);
    await new Promise(r => setTimeout(r, 2000));
    setEmailingId(null);
    setShowToast(lang === 'en' ? `Invoice emailed to ${client.email}` : `Інвойс надіслано на ${client.email}`);
    setTimeout(() => setShowToast(null), 4000);
  };

  const currentModalClient = clients.find(c => c.id === txModalClientId);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl relative z-10 border border-slate-200">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-600/20 mb-6">
              <Fuel className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 text-center">FuelTrack Pro</h1>
            <p className="text-slate-500 text-center text-sm font-medium">Complete fleet fuel management system.</p>
          </div>
          <form onSubmit={handleGoogleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Authorized Email Address</label>
              <input 
                type="email" 
                required 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. andriy.pelypenko@gmail.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <button 
              disabled={isLoggingIn || !loginEmail}
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />}
              Sign in with Google
            </button>
          </form>
          <div className="mt-8 flex justify-center">
             <button 
              onClick={() => setLang(lang === 'en' ? 'uk' : 'en')}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest"
             >
               <Languages className="w-4 h-4" />
               {lang === 'en' ? 'Switch to Ukrainian' : 'Перемкнути на Англійську'}
             </button>
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
            <div className="bg-blue-600 p-2 rounded-lg">
              <Fuel className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FuelTrack Pro</h1>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: t.overview },
              { id: 'clients', icon: Users, label: t.clients },
              { id: 'transactions', icon: FileText, label: t.transactions },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            {isAdmin && (
               <button
                onClick={() => setActiveView('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">{t.userManagement}</span>
              </button>
            )}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800 space-y-4">
           <div className="flex items-center gap-3 px-2">
             <div className="relative">
               <img src={user.photoUrl} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="Avatar" />
               <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                 {isAdmin ? <ShieldCheck className="w-2.5 h-2.5 text-white" /> : <UserIcon className="w-2.5 h-2.5 text-white" />}
               </div>
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-sm font-bold truncate">{user.name}</span>
               <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isAdmin ? 'text-emerald-400' : 'text-blue-400'}`}>
                 {isAdmin ? t.admin : t.staff}
               </span>
             </div>
           </div>
           <button 
            onClick={() => setLang(lang === 'en' ? 'uk' : 'en')}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
           >
             <Languages className="w-4 h-4" />
             {lang === 'en' ? 'English' : 'Українська'}
           </button>
           <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
           >
             <LogOut className="w-4 h-4" />
             {t.logout}
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex flex-wrap gap-4 justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-800">
                {activeView === 'users' ? t.userManagement : (t as any)[activeView]}
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.search}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {activeView === 'clients' && canManageData && (
                <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold flex items-center gap-2 border border-slate-200">
                  <Upload className="w-4 h-4" />
                  {t.importClients}
                  <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImportClients} />
                </label>
              )}

              {activeView === 'transactions' && canManageData && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportExcel}
                    className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold flex items-center gap-2 border border-emerald-200"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {t.exportExcel}
                  </button>
                  <button 
                    onClick={handleExportConsolidatedInvoice}
                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-bold flex items-center gap-2 border border-indigo-200"
                  >
                    <Download className="w-4 h-4" />
                    {t.exportInvoice}
                  </button>
                  <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold flex items-center gap-2 border border-slate-200">
                    <Upload className="w-4 h-4" />
                    {t.importFuel}
                    <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImportTransactions} />
                  </label>
                </div>
              )}

              {activeView === 'users' && isAdmin && (
                <button 
                  onClick={() => setIsAddingUser(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <UserPlus className="w-4 h-4" />
                  {t.newUser}
                </button>
              )}

              {activeView === 'clients' && canManageData && (
                  <button 
                    onClick={() => setIsAddingClient(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    {t.newClient}
                  </button>
              )}

              {activeView === 'transactions' && canManageData && (
                <button 
                  onClick={() => setIsAddingTransaction(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  {t.recordFuel}
                </button>
              )}
            </div>
          </div>

          {activeView === 'transactions' && (
            <div className="mt-4 flex flex-wrap items-center gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3">
                 <Filter className="w-4 h-4 text-slate-400" />
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.account}</span>
                 <select 
                    className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 font-bold focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="all">{t.allClients}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>

               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.startDate}</span>
                 <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>

               <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.endDate}</span>
                 <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>

               {(startDate || endDate || selectedClientId !== 'all') && (
                 <button 
                  onClick={() => { setStartDate(''); setEndDate(''); setSelectedClientId('all'); }}
                  className="text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1 ml-auto"
                 >
                   <XCircle className="w-4 h-4" />
                   {t.resetFilter}
                 </button>
               )}
            </div>
          )}
        </header>

        <div className="p-8">
          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: t.totalLiters, value: stats.totalLiters.toLocaleString() + ' L', icon: Fuel, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: t.revenue, value: stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' ' + t.currency, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: t.margin, value: stats.totalMargin.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' ' + t.currency, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
                    <div className={`${s.bg} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">{s.label}</p>
                      <p className="text-2xl font-black text-slate-800">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-4">
                       <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                       </div>
                       <h3 className="text-xl font-bold tracking-tight">{t.intelligence}</h3>
                     </div>
                     {aiInsight ? (
                       <p className="text-indigo-50 leading-relaxed font-medium text-lg italic underline decoration-indigo-400 decoration-wavy underline-offset-4 mb-6">"{aiInsight}"</p>
                     ) : (
                       <p className="text-indigo-50 leading-relaxed max-w-2xl text-lg mb-6">{t.aiDescription}</p>
                     )}
                     <button 
                      disabled={isGeneratingAi}
                      onClick={runAiInsights}
                      className="bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-xl text-sm font-black transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
                     >
                       {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                       {isGeneratingAi ? t.analyzing : aiInsight ? t.getInsights : t.getInsights}
                     </button>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-800">{t.liveActivity}</h3>
                  <button onClick={() => setActiveView('transactions')} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1 group">
                    {t.viewLedger} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map((tx) => {
                    const client = clients.find(c => c.id === tx.clientId);
                    return (
                      <div key={tx.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                            <MapPin className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{tx.stationName}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              <span className="text-blue-600">{client?.name || t.unassigned}</span> • {tx.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-800">{tx.liters.toFixed(2)} L</p>
                          <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {(tx.liters * (tx.costPerLiter + (client?.marginPerLiter || 0))).toFixed(2)} {t.currency}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeView === 'clients' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{t.idRef}</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{t.identity}</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{t.activeCards}</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t.marginL}</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.operations}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.map(client => (
                      <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{client.uniqueId}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-slate-900 leading-tight">{client.name}</span>
                            <span className="text-xs text-slate-400 font-medium">{client.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {client.fuelCardNumbers.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase border border-blue-100">{c}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-black text-emerald-600">
                          <span className="bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            {client.marginPerLiter.toFixed(2)} {t.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          {isAdmin && (
                            <button 
                              onClick={() => setEditingClient(client)}
                              className="text-slate-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title={t.editClient}
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              const clientTx = transactions.filter(t => t.clientId === client.id);
                              if (clientTx.length === 0) alert(lang === 'en' ? "No activity found." : "Активності не знайдено.");
                              else downloadInvoice(client, clientTx);
                            }}
                            className="text-slate-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleEmailInvoice(client)}
                            disabled={emailingId === client.id}
                            className={`p-2 rounded-lg transition-colors ${emailingId === client.id ? 'text-blue-400 bg-blue-50 animate-pulse' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                            title="Email Invoice"
                          >
                            {emailingId === client.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                          </button>
                          {canManageData && (
                            <button 
                              onClick={() => setClients(clients.filter(c => c.id !== client.id))}
                              className="text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Client"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeView === 'users' && isAdmin && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{t.member}</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{t.email}</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t.role}</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {authorizedUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.photoUrl} className="w-10 h-10 rounded-full border border-slate-200" alt="" />
                            <span className="text-sm font-black text-slate-900 leading-tight">{u.name} {u.id === user.id && "(You)"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{u.email}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            u.role === 'admin' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {u.role === 'admin' ? t.admin : t.staff}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            disabled={u.id === user.id}
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-slate-300 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeView === 'transactions' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
               <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[1300px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{t.logEntry}</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{t.account}</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t.assetCard}</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{t.station}</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t.liters}</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.buyPrice}</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.sellPrice}</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.invoiceTotal}</th>
                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTransactions.map(tx => {
                        const client = clients.find(c => c.id === tx.clientId);
                        const clientPrice = tx.costPerLiter + (client?.marginPerLiter || 0);
                        const totalPaid = tx.liters * clientPrice;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">{tx.date}</span>
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase">{tx.time}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                {client?.name || t.manual}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xs font-mono font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{tx.fuelCardNumber}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-900 truncate block max-w-[150px]">{tx.stationName}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-black text-slate-900">{tx.liters.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs font-bold text-slate-400">{tx.costPerLiter.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-bold text-emerald-600">{clientPrice.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                                {totalPaid.toFixed(2)} {t.currency}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-1">
                              {canManageData && (
                                <>
                                  <button 
                                    onClick={() => setEditingTransaction(tx)}
                                    className="text-slate-300 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                                    title={t.editTransaction}
                                  >
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                  <button 
                                    onClick={() => setTransactions(transactions.filter(t => t.id !== tx.id))}
                                    className="text-slate-300 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALS REMAIN UNCHANGED FROM PREVIOUS STATE IN TERMS OF LOGIC */}
      {/* Invite User Modal */}
      {isAddingUser && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.inviteMember}</h3>
                <p className="text-slate-400 text-sm font-medium">{t.grantAccess}</p>
              </div>
              <button onClick={() => setIsAddingUser(false)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 text-2xl font-light">&times;</button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.fullName}</label>
                <input required name="name" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="Jordan Smith" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.primaryEmail}</label>
                <input required name="email" type="email" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="jordan@company.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.permissions}</label>
                <select required name="role" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none">
                  <option value="user">{t.staff}</option>
                  <option value="admin">{t.admin}</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                {t.confirmInvite}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddingClient && canManageData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.newClient}</h3>
                <p className="text-slate-400 text-sm font-medium">Create sub-account.</p>
              </div>
              <button onClick={() => setIsAddingClient(false)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 text-2xl font-light">&times;</button>
            </div>
            <form onSubmit={handleAddClient} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.internalId}</label>
                  <input required name="uniqueId" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="e.g. CLI-101" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.marginL}</label>
                  <input required name="margin" type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="0.25" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.accountName}</label>
                <input required name="name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Global Logistics Corp" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.primaryEmail}</label>
                <input required name="email" type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="billing@glc.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.cards}</label>
                <textarea required name="cards" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[80px]" placeholder="CARD-991, CARD-992"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                {t.authorize}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.editClient}</h3>
                <p className="text-slate-400 text-sm font-medium">Update account information.</p>
              </div>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 text-2xl font-light">&times;</button>
            </div>
            <form onSubmit={handleUpdateClient} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.internalId}</label>
                  <input required name="uniqueId" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="e.g. CLI-101" defaultValue={editingClient.uniqueId} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.marginL}</label>
                  <input required name="margin" type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="0.25" defaultValue={editingClient.marginPerLiter} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.accountName}</label>
                <input required name="name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Global Logistics Corp" defaultValue={editingClient.name} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.primaryEmail}</label>
                <input required name="email" type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="billing@glc.com" defaultValue={editingClient.email} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.cards}</label>
                <textarea required name="cards" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[80px]" placeholder="CARD-991, CARD-992" defaultValue={editingClient.fuelCardNumbers.join(', ')}></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                {t.updateAccount}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal (Add/Edit) */}
      {(isAddingTransaction || editingTransaction) && canManageData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingTransaction ? t.editTransaction : t.logFuel}</h3>
                <p className="text-slate-400 text-sm font-medium">{t.manualEntry}</p>
              </div>
              <button onClick={() => { setIsAddingTransaction(false); setEditingTransaction(null); }} className="text-slate-400 hover:text-slate-900 transition-colors p-2 text-2xl font-light">&times;</button>
            </div>
            <form onSubmit={handleSaveTransaction} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {txError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in zoom-in-95">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold leading-tight">{txError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.clientAccount}</label>
                  <select 
                    required 
                    name="clientId" 
                    value={txModalClientId}
                    onChange={(e) => {
                        setTxModalClientId(e.target.value);
                        setTxError(null);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                  >
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.assetCard}</label>
                  <select 
                    required 
                    name="fuelCardNumber" 
                    defaultValue={editingTransaction?.fuelCardNumber}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                  >
                    {currentModalClient?.fuelCardNumbers.map(card => (
                      <option key={card} value={card}>{card}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.date}</label>
                  <input required name="date" type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" defaultValue={editingTransaction?.date || format(new Date(), 'yyyy-MM-dd')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.time}</label>
                  <input required name="time" type="text" pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]" title={t.timeFormatHint} placeholder="HH:MM" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" defaultValue={editingTransaction?.time || format(new Date(), 'HH:mm')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.stationEntity}</label>
                  <input required name="stationName" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Shell" defaultValue={editingTransaction?.stationName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.liters}</label>
                  <input required name="liters" type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="0.00" defaultValue={editingTransaction?.liters} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.stationAddress}</label>
                <input required name="stationAddress" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="123 Main St, Kyiv" defaultValue={editingTransaction?.stationAddress} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.purchaseCost}</label>
                <input required name="costPerLiter" type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="1.45" defaultValue={editingTransaction?.costPerLiter} />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input name="showCost" type="checkbox" id="showCost" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked={editingTransaction ? editingTransaction.showCostToClient : true} />
                <label htmlFor="showCost" className="text-sm text-slate-600 font-bold select-none cursor-pointer">{t.showCost}</label>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                {editingTransaction ? t.updateTransaction : t.commit}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
