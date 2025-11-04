import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Activity, Bot, PlayCircle, StopCircle, Menu, X, Clock, Target, AlertTriangle, Star, Search, ChevronDown, Plus, Minus } from 'lucide-react';

const DerivTradingPlatform = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [appId, setAppId] = useState('1089');
  const [demoAccount, setDemoAccount] = useState(null);
  const [realAccount, setRealAccount] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('1HZ100V');
  const [candleData, setCandleData] = useState([]);
  const [currentTick, setCurrentTick] = useState(null);
  const [priceTable, setPriceTable] = useState([]);
  const [botActive, setBotActive] = useState(false);
  const [botStats, setBotStats] = useState({ observing: 0, opportunities: 0, trades: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeInterval, setTimeInterval] = useState('1m');
  const [trades, setTrades] = useState([]);
  const [stakeAmount, setStakeAmount] = useState(10);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({ derived: true });
  const [favorites, setFavorites] = useState([]);
  const [multiplier, setMultiplier] = useState(100);
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(false);
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [chartOffset, setChartOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 });
  const [zoomLevel, setZoomLevel] = useState(60);
  const [proposalIds, setProposalIds] = useState({});
  
  const wsRef = useRef(null);
  const chartContainerRef = useRef(null);
  const canvasRef = useRef(null);

  const derivMarkets = {
    derived: {
      name: 'Derived',
      subcategories: {
        continuous: {
          name: 'Continuous Indices',
          items: [
            { symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', display_name: 'Volatility 10 (1s) Index' },
            { symbol: 'R_10', name: 'Volatility 10 Index', display_name: 'Volatility 10 Index' },
            { symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', display_name: 'Volatility 25 (1s) Index' },
            { symbol: 'R_25', name: 'Volatility 25 Index', display_name: 'Volatility 25 Index' },
            { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', display_name: 'Volatility 50 (1s) Index' },
            { symbol: 'R_50', name: 'Volatility 50 Index', display_name: 'Volatility 50 Index' },
            { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', display_name: 'Volatility 75 (1s) Index' },
            { symbol: 'R_75', name: 'Volatility 75 Index', display_name: 'Volatility 75 Index' },
            { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', display_name: 'Volatility 100 (1s) Index' },
            { symbol: 'R_100', name: 'Volatility 100 Index', display_name: 'Volatility 100 Index' }
          ]
        },
        crash_boom: {
          name: 'Crash/Boom Indices',
          items: [
            { symbol: 'BOOM300N', name: 'Boom 300 Index', display_name: 'Boom 300 Index' },
            { symbol: 'BOOM500', name: 'Boom 500 Index', display_name: 'Boom 500 Index' },
            { symbol: 'BOOM600N', name: 'Boom 600 Index', display_name: 'Boom 600 Index' },
            { symbol: 'BOOM900', name: 'Boom 900 Index', display_name: 'Boom 900 Index' },
            { symbol: 'BOOM1000', name: 'Boom 1000 Index', display_name: 'Boom 1000 Index' },
            { symbol: 'CRASH300N', name: 'Crash 300 Index', display_name: 'Crash 300 Index' },
            { symbol: 'CRASH500', name: 'Crash 500 Index', display_name: 'Crash 500 Index' },
            { symbol: 'CRASH600N', name: 'Crash 600 Index', display_name: 'Crash 600 Index' },
            { symbol: 'CRASH900', name: 'Crash 900 Index', display_name: 'Crash 900 Index' },
            { symbol: 'CRASH1000', name: 'Crash 1000 Index', display_name: 'Crash 1000 Index' }
          ]
        },
        jump: {
          name: 'Jump Indices',
          items: [
            { symbol: 'JD10', name: 'Jump 10 Index', display_name: 'Jump 10 Index' },
            { symbol: 'JD25', name: 'Jump 25 Index', display_name: 'Jump 25 Index' },
            { symbol: 'JD50', name: 'Jump 50 Index', display_name: 'Jump 50 Index' },
            { symbol: 'JD75', name: 'Jump 75 Index', display_name: 'Jump 75 Index' },
            { symbol: 'JD100', name: 'Jump 100 Index', display_name: 'Jump 100 Index' }
          ]
        },
        step: {
          name: 'Step Indices',
          items: [
            { symbol: 'stpRNG', name: 'Step Index', display_name: 'Step Index' }
          ]
        },
        range_break: {
          name: 'Range Break Indices',
          items: [
            { symbol: 'RDBULL', name: 'Range Break 100 Index', display_name: 'Range Break 100 Index' },
            { symbol: 'RDBEAR', name: 'Range Break 200 Index', display_name: 'Range Break 200 Index' }
          ]
        }
      }
    },
    forex: {
      name: 'Forex',
      subcategories: {
        major: {
          name: 'Major Pairs',
          items: [
            { symbol: 'frxAUDJPY', name: 'AUD/JPY', display_name: 'AUD/JPY' },
            { symbol: 'frxAUDUSD', name: 'AUD/USD', display_name: 'AUD/USD' },
            { symbol: 'frxEURAUD', name: 'EUR/AUD', display_name: 'EUR/AUD' },
            { symbol: 'frxEURCAD', name: 'EUR/CAD', display_name: 'EUR/CAD' },
            { symbol: 'frxEURCHF', name: 'EUR/CHF', display_name: 'EUR/CHF' },
            { symbol: 'frxEURGBP', name: 'EUR/GBP', display_name: 'EUR/GBP' },
            { symbol: 'frxEURJPY', name: 'EUR/JPY', display_name: 'EUR/JPY' },
            { symbol: 'frxEURUSD', name: 'EUR/USD', display_name: 'EUR/USD' },
            { symbol: 'frxGBPAUD', name: 'GBP/AUD', display_name: 'GBP/AUD' },
            { symbol: 'frxGBPJPY', name: 'GBP/JPY', display_name: 'GBP/JPY' },
            { symbol: 'frxGBPUSD', name: 'GBP/USD', display_name: 'GBP/USD' },
            { symbol: 'frxUSDCAD', name: 'USD/CAD', display_name: 'USD/CAD' },
            { symbol: 'frxUSDCHF', name: 'USD/CHF', display_name: 'USD/CHF' },
            { symbol: 'frxUSDJPY', name: 'USD/JPY', display_name: 'USD/JPY' }
          ]
        }
      }
    },
    commodities: {
      name: 'Commodities',
      subcategories: {
        metals: {
          name: 'Metals',
          items: [
            { symbol: 'frxXAUUSD', name: 'Gold/USD', display_name: 'Gold/USD' },
            { symbol: 'frxXAGUSD', name: 'Silver/USD', display_name: 'Silver/USD' },
            { symbol: 'frxXPDUSD', name: 'Palladium/USD', display_name: 'Palladium/USD' },
            { symbol: 'frxXPTUSD', name: 'Platinum/USD', display_name: 'Platinum/USD' }
          ]
        },
        energy: {
          name: 'Energy',
          items: [
            { symbol: 'frxBROUSD', name: 'Oil/USD', display_name: 'Oil/USD' }
          ]
        }
      }
    },
    cryptocurrencies: {
      name: 'Cryptocurrencies',
      items: [
        { symbol: 'cryBTCUSD', name: 'BTC/USD', display_name: 'BTC/USD' },
        { symbol: 'cryETHUSD', name: 'ETH/USD', display_name: 'ETH/USD' },
        { symbol: 'cryLTCUSD', name: 'LTC/USD', display_name: 'LTC/USD' }
      ]
    }
  };

  const timeIntervals = ['1m', '5m', '15m', '1h', '4h', '1d'];

  // Enhanced Candlestick Chart with scroll and zoom
  const CandlestickChart = ({ data }) => {
    useEffect(() => {
      if (!canvasRef.current || !data || data.length === 0) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const padding = { top: 20, right: 80, bottom: 40, left: 20 };

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Calculate visible range with offset
      const visibleCandles = Math.min(Math.max(20, zoomLevel), data.length);
      const endIndex = Math.min(data.length - chartOffset, data.length);
      const startIndex = Math.max(0, endIndex - visibleCandles);
      const visibleData = data.slice(startIndex, endIndex);

      if (visibleData.length === 0) return;

      const prices = visibleData.flatMap(d => [d.high, d.low, d.open, d.close]);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const priceRange = maxPrice - minPrice;
      const paddedMax = maxPrice + priceRange * 0.05;
      const paddedMin = minPrice - priceRange * 0.05;
      const paddedRange = paddedMax - paddedMin;

      const candleSpacing = 2;
      const candleWidth = Math.max((chartWidth / visibleCandles) - candleSpacing, 2);

      const priceToY = (price) => {
        return padding.top + ((paddedMax - price) / paddedRange) * chartHeight;
      };

      // Grid lines
      ctx.strokeStyle = '#F3F4F6';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.lineWidth = 1;

      for (let i = 0; i <= 5; i++) {
        const ratio = i / 5;
        const y = padding.top + ratio * chartHeight;
        const price = paddedMax - ratio * paddedRange;

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillText(price.toFixed(2), width - padding.right + 5, y + 4);
      }

      // Candlesticks
      visibleData.forEach((candle, index) => {
        const x = padding.left + (index * (candleWidth + candleSpacing)) + candleWidth / 2;
        
        const isGreen = candle.close >= candle.open;
        const color = isGreen ? '#10B981' : '#EF4444';

        const highY = priceToY(candle.high);
        const lowY = priceToY(candle.low);
        const openY = priceToY(candle.open);
        const closeY = priceToY(candle.close);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
        
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });

      // Time labels
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'center';
      const timeStep = Math.max(1, Math.ceil(visibleCandles / 8));
      visibleData.filter((_, i) => i % timeStep === 0).forEach((candle, i) => {
        const index = i * timeStep;
        const x = padding.left + (index * (candleWidth + candleSpacing)) + candleWidth / 2;
        ctx.fillText(candle.time, x, height - 15);
      });

      // Current price line (only show if at latest data)
      if (currentTick && chartOffset === 0) {
        const currentY = priceToY(currentTick.price);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding.left, currentY);
        ctx.lineTo(width - padding.right, currentY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(width - padding.right + 2, currentY - 10, 70, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText(currentTick.price.toFixed(2), width - padding.right + 7, currentY + 4);
      }

    }, [data, currentTick, chartOffset, zoomLevel]);

    const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, offset: chartOffset });
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = dragStart.x - e.clientX;
      const candlesPerPixel = 0.5;
      const newOffset = Math.max(0, Math.min(candleData.length - zoomLevel, dragStart.offset + Math.floor(dx * candlesPerPixel)));
      setChartOffset(newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + scroll
        const delta = e.deltaY > 0 ? 10 : -10;
        setZoomLevel(prev => Math.max(20, Math.min(200, prev + delta)));
      } else {
        // Horizontal scroll
        const delta = Math.sign(e.deltaY) * 5;
        setChartOffset(prev => Math.max(0, Math.min(candleData.length - zoomLevel, prev + delta)));
      }
    };

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, dragStart]);

    return (
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      />
    );
  };

  const connectToDerivAPI = (token, app_id) => {
    setConnectionStatus('connecting');
    setErrorMessage('');
    
    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`);
    
    ws.onopen = () => {
      setConnectionStatus('connected');
      ws.send(JSON.stringify({ authorize: token }));
    };
    
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      console.log('Received:', data);
      
      if (data.authorize) {
        const accountList = data.authorize.account_list || [];
        
        let demoAcc = accountList.find(acc => acc.is_virtual === 1);
        const realAcc = accountList.find(acc => acc.is_virtual === 0);
        
        // Auto-create demo account with $10,000 if none exists
        if (!demoAcc && accountList.length > 0) {
          demoAcc = {
            loginid: accountList[0].loginid + '_DEMO',
            balance: 10000,
            currency: 'USD',
            is_virtual: 1
          };
        } else if (demoAcc) {
          // Ensure demo has at least $10,000
          if (parseFloat(demoAcc.balance || 0) < 10000) {
            demoAcc.balance = 10000;
          }
        }
        
        if (demoAcc) {
          const demo = {
            loginid: demoAcc.loginid,
            balance: parseFloat(demoAcc.balance || 10000),
            currency: demoAcc.currency || 'USD',
            type: 'demo',
            is_virtual: true
          };
          setDemoAccount(demo);
          setCurrentAccount(demo);
        }
        
        if (realAcc) {
          const real = {
            loginid: realAcc.loginid,
            balance: parseFloat(realAcc.balance || 0),
            currency: realAcc.currency || 'USD',
            type: 'real',
            is_virtual: false
          };
          setRealAccount(real);
        }
        
        setIsAuthenticated(true);
        setShowLoginModal(false);
        
        ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        subscribeToCandles(ws, selectedAsset);
        ws.send(JSON.stringify({ ticks: selectedAsset, subscribe: 1 }));
      }
      
      if (data.error) {
        console.error('API Error:', data.error);
        if (data.msg_type === 'authorize') {
          setErrorMessage(data.error.message);
          setConnectionStatus('error');
        }
        if (data.msg_type === 'buy') {
          console.error('Trade error:', data.error.message);
          alert(`Trade failed: ${data.error.message}`);
        }
      }
      
      if (data.candles) {
        const candles = data.candles.map(candle => ({
          time: new Date(candle.epoch * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          timestamp: candle.epoch * 1000,
          open: parseFloat(candle.open),
          high: parseFloat(candle.high),
          low: parseFloat(candle.low),
          close: parseFloat(candle.close)
        }));
        setCandleData(candles);
        setChartOffset(0);
      }
      
      if (data.ohlc) {
        const newCandle = {
          time: new Date(data.ohlc.open_time * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          timestamp: data.ohlc.open_time * 1000,
          open: parseFloat(data.ohlc.open),
          high: parseFloat(data.ohlc.high),
          low: parseFloat(data.ohlc.low),
          close: parseFloat(data.ohlc.close)
        };
        
        setCandleData(prev => {
          const updated = [...prev];
          const lastCandle = updated[updated.length - 1];
          
          if (lastCandle && lastCandle.timestamp === newCandle.timestamp) {
            updated[updated.length - 1] = newCandle;
          } else {
            updated.push(newCandle);
            if (updated.length > 500) updated.shift();
          }
          
          return updated;
        });
        
        if (chartOffset === 0) {
          setChartOffset(0);
        }
      }
      
      if (data.tick) {
        const tick = {
          time: new Date(data.tick.epoch * 1000).toLocaleTimeString(),
          timestamp: data.tick.epoch * 1000,
          price: parseFloat(data.tick.quote)
        };
        
        setCurrentTick(tick);
        setPriceTable(prev => {
          const newTable = [tick, ...prev.slice(0, 49)];
          return newTable;
        });
        
        setCandleData(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastCandle = updated[updated.length - 1];
          
          updated[updated.length - 1] = {
            ...lastCandle,
            close: tick.price,
            high: Math.max(lastCandle.high, tick.price),
            low: Math.min(lastCandle.low, tick.price)
          };
          
          return updated;
        });
      }
      
      if (data.proposal) {
        const reqId = data.echo_req?.passthrough?.request_id;
        if (reqId) {
          setProposalIds(prev => ({ ...prev, [reqId]: data.proposal.id }));
        }
      }
      
      if (data.buy) {
        console.log('✅ Trade BUY response received:', data.buy);
        
        const trade = {
          id: data.buy.contract_id,
          time: new Date().toLocaleTimeString(),
          symbol: selectedAsset,
          type: data.buy.contract_type,
          stake: parseFloat(data.buy.buy_price),
          status: 'open',
          contractId: data.buy.contract_id,
          profit: 0,
          buyPrice: parseFloat(data.buy.buy_price)
        };
        
        console.log('Adding trade to list:', trade);
        setTrades(prev => {
          console.log('Previous trades:', prev);
          const newTrades = [trade, ...prev];
          console.log('New trades:', newTrades);
          return newTrades;
        });
        
        // Deduct stake amount immediately when trade is placed
        if (currentAccount?.is_virtual) {
          const newBalance = currentAccount.balance - trade.stake;
          console.log(`💰 Balance update: ${currentAccount.balance} - ${trade.stake} = ${newBalance}`);
          setDemoAccount(prev => prev ? { ...prev, balance: newBalance } : prev);
          setCurrentAccount(prev => prev ? { ...prev, balance: newBalance } : prev);
        }
        
        // Subscribe to contract updates
        ws.send(JSON.stringify({ proposal_open_contract: 1, contract_id: data.buy.contract_id, subscribe: 1 }));
      }
      
      if (data.proposal_open_contract) {
        const contract = data.proposal_open_contract;
        console.log('📊 Contract update:', contract.status, 'Profit:', contract.profit);
        
        setTrades(prev => prev.map(t => {
          if (t.contractId === contract.contract_id) {
            const newProfit = contract.profit ? parseFloat(contract.profit) : 0;
            const wasOpen = t.status === 'open';
            const isClosed = contract.status !== 'open';
            
            // When contract closes, add payout to balance
            if (wasOpen && isClosed && currentAccount?.is_virtual) {
              const payout = contract.sell_price ? parseFloat(contract.sell_price) : 0;
              
              if (payout > 0) {
                const newBalance = currentAccount.balance + payout;
                setDemoAccount(prev => prev ? { ...prev, balance: newBalance } : prev);
                setCurrentAccount(prev => prev ? { ...prev, balance: newBalance } : prev);
                console.log(`✅ Trade closed: ${contract.status}, Payout: ${payout}, New Balance: ${newBalance}`);
              } else {
                console.log(`❌ Trade closed: ${contract.status}, No payout (loss)`);
              }
            }
            
            return { 
              ...t, 
              status: contract.status, 
              profit: newProfit,
              payout: contract.sell_price ? parseFloat(contract.sell_price) : 0
            };
          }
          return t;
        }));
      }
      
      if (data.balance && !currentAccount?.is_virtual) {
        const newBalance = parseFloat(data.balance.balance);
        const loginid = data.balance.loginid;
        
        if (realAccount && loginid === realAccount.loginid) {
          setRealAccount(prev => ({ ...prev, balance: newBalance }));
          if (currentAccount?.loginid === loginid) {
            setCurrentAccount(prev => ({ ...prev, balance: newBalance }));
          }
        }
      }
    };
    
    ws.onerror = () => {
      setConnectionStatus('error');
      setErrorMessage('WebSocket connection error');
    };
    
    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };
    
    wsRef.current = ws;
  };

  const subscribeToCandles = (ws, symbol) => {
    const intervalMap = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400 };
    const granularity = intervalMap[timeInterval] || 60;
    
    ws.send(JSON.stringify({ forget_all: 'candles' }));
    ws.send(JSON.stringify({ forget_all: 'ticks' }));
    
    ws.send(JSON.stringify({
      ticks_history: symbol,
      adjust_start_time: 1,
      count: 500,
      end: 'latest',
      granularity: granularity,
      start: 1,
      style: 'candles'
    }));
    
    ws.send(JSON.stringify({
      ticks_history: symbol,
      adjust_start_time: 1,
      granularity: granularity,
      style: 'candles',
      subscribe: 1
    }));
  };

  const switchAccount = (account) => {
    if (!wsRef.current || connectionStatus !== 'connected') return;
    
    setCurrentAccount(account);
    setShowAccountSwitcher(false);
    
    wsRef.current.send(JSON.stringify({ balance: 1, account: account.loginid }));
  };

  const handleLogin = () => {
    if (!authToken.trim()) {
      setErrorMessage('Please enter a valid API token');
      return;
    }
    connectToDerivAPI(authToken, appId);
  };

  const executeTrade = (contractType) => {
    if (!wsRef.current || !isAuthenticated || !currentAccount) {
      console.error('Not connected. Please login first.');
      return false;
    }
    
    if (currentAccount.balance < stakeAmount) {
      console.error('Insufficient balance');
      return false;
    }
    
    // For demo account, simulate trade locally
    if (currentAccount.is_virtual) {
      const tradeId = `demo_${Date.now()}_${Math.random()}`;
      const currentPrice = currentTick?.price || 0;
      
      const trade = {
        id: tradeId,
        time: new Date().toLocaleTimeString(),
        symbol: selectedAsset,
        type: contractType === 'MULTUP' ? 'Up' : 'Down',
        stake: stakeAmount,
        status: 'open',
        contractId: tradeId,
        profit: 0,
        entryPrice: currentPrice,
        isDemo: true
      };
      
      console.log('📝 Demo trade created:', trade);
      
      // Add trade to list
      setTrades(prev => [trade, ...prev]);
      
      // Deduct stake from balance
      const newBalance = currentAccount.balance - stakeAmount;
      setDemoAccount(prev => prev ? { ...prev, balance: newBalance } : prev);
      setCurrentAccount(prev => prev ? { ...prev, balance: newBalance } : prev);
      
      // Simulate trade result after 10-15 seconds
      const duration = 10000 + Math.random() * 5000;
      setTimeout(() => {
        const winChance = 0.48; // 48% win rate
        const isWin = Math.random() < winChance;
        const profitMultiplier = multiplier / 100;
        
        if (isWin) {
          const payout = stakeAmount + (stakeAmount * profitMultiplier * 0.9); // 90% of multiplier as profit
          const profit = payout - stakeAmount;
          
          setTrades(prev => prev.map(t => 
            t.id === tradeId 
              ? { ...t, status: 'won', profit: profit, payout: payout }
              : t
          ));
          
          setDemoAccount(prev => prev ? { ...prev, balance: prev.balance + payout } : prev);
          setCurrentAccount(prev => prev ? { ...prev, balance: prev.balance + payout } : prev);
          
          console.log(`✅ Demo trade WON: +${profit.toFixed(2)} USD`);
        } else {
          const profit = -stakeAmount;
          
          setTrades(prev => prev.map(t => 
            t.id === tradeId 
              ? { ...t, status: 'lost', profit: profit, payout: 0 }
              : t
          ));
          
          console.log(`❌ Demo trade LOST: ${profit.toFixed(2)} USD`);
        }
      }, duration);
      
      return true;
    }
    
    // For real account, use actual Deriv API
    const buyPayload = {
      buy: 1,
      price: stakeAmount,
      parameters: {
        amount: stakeAmount,
        basis: 'stake',
        contract_type: contractType,
        currency: currentAccount.currency,
        duration: 5,
        duration_unit: 't',
        symbol: selectedAsset,
        multiplier: multiplier
      }
    };
    
    console.log('Sending real trade:', buyPayload);
    wsRef.current.send(JSON.stringify(buyPayload));
    
    return true;
  };

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({ ...prev, [categoryKey]: !prev[categoryKey] }));
  };

  const toggleFavorite = (symbol) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    );
  };

  const toggleBot = () => {
    setBotActive(!botActive);
    if (!botActive) {
      setBotStats({ observing: 0, opportunities: 0, trades: 0 });
    }
  };

  useEffect(() => {
    if (wsRef.current && isAuthenticated && selectedAsset) {
      subscribeToCandles(wsRef.current, selectedAsset);
      wsRef.current.send(JSON.stringify({ ticks: selectedAsset, subscribe: 1 }));
      setCandleData([]);
      setPriceTable([]);
      setCurrentTick(null);
      setChartOffset(0);
    }
  }, [selectedAsset, timeInterval, isAuthenticated]);

  useEffect(() => {
    if (botActive && currentTick && currentAccount && currentAccount.balance >= stakeAmount) {
      // Update stats on every tick
      setBotStats(prev => ({
        observing: prev.observing + 1,
        opportunities: prev.opportunities + (Math.random() < 0.15 ? 1 : 0),
        trades: prev.trades
      }));
      
      // More aggressive trading: 2% chance per tick
      if (Math.random() < 0.02) {
        const tradeType = Math.random() > 0.5 ? 'MULTUP' : 'MULTDOWN';
        const success = executeTrade(tradeType);
        if (success) {
          setBotStats(prev => ({ ...prev, trades: prev.trades + 1 }));
        }
      }
    }
  }, [currentTick, botActive, currentAccount]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const getAccountsForSwitcher = () => {
    const accounts = [];
    if (realAccount) accounts.push(realAccount);
    if (demoAccount) accounts.push(demoAccount);
    return accounts;
  };

  if (showLoginModal && !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '450px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: '#FF444F', color: 'white', fontSize: '28px', fontWeight: 'bold', padding: '12px 20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(255,68,79,0.3)' }}>d</div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Join 3M+ global traders</h1>
            <p style={{ color: '#6B7280', fontSize: '15px' }}>Trade with a trusted broker</p>
          </div>

          {errorMessage && (
            <div style={{ marginBottom: '16px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px', color: '#991B1B', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              {errorMessage}
            </div>
          )}

          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>API Token</label>
              <input
                type="password"
                placeholder="Enter your Deriv API token"
                style={{ width: '100%', padding: '14px 16px', background: 'white', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '15px', outline: 'none', transition: 'border 0.2s' }}
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                onFocus={(e) => e.target.style.borderColor = '#FF444F'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>
                Get your API token from: <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noopener noreferrer" style={{ color: '#FF444F', fontWeight: '500' }}>app.deriv.com/account/api-token</a>
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={connectionStatus === 'connecting'}
              style={{ 
                width: '100%', 
                background: connectionStatus === 'connecting' ? '#9CA3AF' : '#FF444F', 
                color: 'white', 
                fontWeight: '600', 
                padding: '14px', 
                borderRadius: '28px', 
                border: 'none', 
                cursor: connectionStatus === 'connecting' ? 'not-allowed' : 'pointer', 
                fontSize: '16px',
                boxShadow: connectionStatus === 'connecting' ? 'none' : '0 4px 12px rgba(255,68,79,0.3)',
                transition: 'all 0.3s'
              }}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect to Deriv'}
            </button>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
            <p>By connecting, you agree to use this platform responsibly</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#FF444F', color: 'white', fontSize: '18px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '8px' }}>d</div>
            <span style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>Deriv Trader</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {connectionStatus === 'connected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '13px', fontWeight: '500' }}>
              <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
              <span>Live</span>
            </div>
          )}
          
          {currentAccount && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', background: currentAccount.type === 'demo' ? '#3B82F6' : '#10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                    {currentAccount.type === 'demo' ? 'D' : 'R'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>{currentAccount.loginid}</div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#111827' }}>{currentAccount.balance.toFixed(2)} {currentAccount.currency}</div>
                  </div>
                </div>
                {getAccountsForSwitcher().length > 1 && <ChevronDown size={18} color="#9CA3AF" />}
              </button>

              {showAccountSwitcher && getAccountsForSwitcher().length > 1 && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '14px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', minWidth: '320px', zIndex: 1000, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Options accounts</div>
                  </div>
                  {getAccountsForSwitcher().map(acc => (
                    <button
                      key={acc.loginid}
                      onClick={() => switchAccount(acc)}
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '14px', 
                        padding: '16px 18px', 
                        background: acc.loginid === currentAccount.loginid ? '#F9FAFB' : 'white', 
                        border: 'none', 
                        borderBottom: '1px solid #F3F4F6', 
                        cursor: 'pointer', 
                        textAlign: 'left', 
                        transition: 'background 0.2s' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = acc.loginid === currentAccount.loginid ? '#F9FAFB' : 'white'}
                    >
                      <div style={{ width: '48px', height: '48px', background: acc.type === 'demo' ? '#3B82F6' : '#10B981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                        {acc.type === 'demo' ? 'D' : 'R'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '3px', fontWeight: '500' }}>
                          Options {acc.type === 'demo' ? 'Demo' : 'USD'} Wallet
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                          {acc.balance.toFixed(2)} {acc.currency}
                        </div>
                      </div>
                      {acc.type === 'demo' && (
                        <div style={{ background: '#3B82F6', color: 'white', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>Demo</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bot Status Banner */}
      {botActive && (
        <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} />
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Bot Active</span>
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
              <div><Activity size={16} style={{ display: 'inline', marginRight: '6px' }} /><strong>{botStats.observing}</strong> Observing</div>
              <div><Target size={16} style={{ display: 'inline', marginRight: '6px' }} /><strong>{botStats.opportunities}</strong> Opportunities</div>
              <div><TrendingUp size={16} style={{ display: 'inline', marginRight: '6px' }} /><strong>{botStats.trades}</strong> Trades</div>
            </div>
          </div>
          <button onClick={toggleBot} style={{ background: 'white', color: '#10B981', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            Stop Bot
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 120px)' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width: '280px', background: 'white', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={16} />
                <input type="text" placeholder="Search markets..." style={{ width: '100%', paddingLeft: '40px', padding: '10px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {Object.entries(derivMarkets).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <button 
                    onClick={() => toggleCategory(categoryKey)} 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
                  >
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>{category.name}</span>
                    <ChevronDown 
                      size={18} 
                      style={{ 
                        transform: expandedCategories[categoryKey] ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s' 
                      }} 
                    />
                  </button>
                  
                  {expandedCategories[categoryKey] && (
                    <div>
                      {category.subcategories ? (
                        Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                          <div key={subKey}>
                            <div style={{ padding: '10px 16px', background: '#FAFAFA', fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.5px' }}>
                              {subcategory.name}
                            </div>
                            {subcategory.items.map(item => (
                              <button
                                key={item.symbol}
                                onClick={() => setSelectedAsset(item.symbol)}
                                style={{ 
                                  width: '100%', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  padding: '12px 16px 12px 24px', 
                                  background: selectedAsset === item.symbol ? '#FEF2F2' : 'white', 
                                  border: 'none', 
                                  borderLeft: selectedAsset === item.symbol ? '3px solid #FF444F' : '3px solid transparent',
                                  cursor: 'pointer', 
                                  textAlign: 'left',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedAsset !== item.symbol) e.currentTarget.style.background = '#F9FAFB';
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedAsset !== item.symbol) e.currentTarget.style.background = 'white';
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: selectedAsset === item.symbol ? '600' : '500', color: selectedAsset === item.symbol ? '#FF444F' : '#111827' }}>
                                    {item.display_name}
                                  </div>
                                  {currentTick && selectedAsset === item.symbol && (
                                    <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px', fontWeight: '500' }}>
                                      {currentTick.price.toFixed(2)}
                                    </div>
                                  )}
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item.symbol); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                >
                                  <Star 
                                    size={16} 
                                    fill={favorites.includes(item.symbol) ? '#FFB800' : 'none'} 
                                    color={favorites.includes(item.symbol) ? '#FFB800' : '#D1D5DB'} 
                                  />
                                </button>
                              </button>
                            ))}
                          </div>
                        ))
                      ) : (
                        category.items?.map(item => (
                          <button
                            key={item.symbol}
                            onClick={() => setSelectedAsset(item.symbol)}
                            style={{ 
                              width: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '12px 16px 12px 24px', 
                              background: selectedAsset === item.symbol ? '#FEF2F2' : 'white', 
                              border: 'none',
                              borderLeft: selectedAsset === item.symbol ? '3px solid #FF444F' : '3px solid transparent',
                              cursor: 'pointer', 
                              textAlign: 'left',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: selectedAsset === item.symbol ? '600' : '500', color: selectedAsset === item.symbol ? '#FF444F' : '#111827' }}>
                                {item.display_name}
                              </div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(item.symbol); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                              <Star 
                                size={16} 
                                fill={favorites.includes(item.symbol) ? '#FFB800' : 'none'} 
                                color={favorites.includes(item.symbol) ? '#FFB800' : '#D1D5DB'} 
                              />
                            </button>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
          {/* Asset Header */}
          <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                  {(() => {
                    for (const category of Object.values(derivMarkets)) {
                      if (category.subcategories) {
                        for (const subcategory of Object.values(category.subcategories)) {
                          const item = subcategory.items.find(i => i.symbol === selectedAsset);
                          if (item) return item.display_name;
                        }
                      } else if (category.items) {
                        const item = category.items.find(i => i.symbol === selectedAsset);
                        if (item) return item.display_name;
                      }
                    }
                    return selectedAsset;
                  })()}
                </div>
                {currentTick && (
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginTop: '4px' }}>
                    {currentTick.price.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {timeIntervals.map(interval => (
                <button
                  key={interval}
                  onClick={() => setTimeInterval(interval)}
                  style={{ 
                    padding: '8px 14px', 
                    background: timeInterval === interval ? '#FF444F' : 'white', 
                    color: timeInterval === interval ? 'white' : '#6B7280', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div style={{ flex: 1, padding: '20px', background: '#FFFFFF', overflow: 'hidden', position: 'relative' }}>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {candleData.length > 0 ? (
                <>
                  <CandlestickChart data={candleData} />
                  <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.95)', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(20, prev - 10))}
                      style={{ background: '#F3F4F6', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', minWidth: '60px', textAlign: 'center' }}>
                      {Math.min(zoomLevel, candleData.length)}
                    </span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                      style={{ background: '#F3F4F6', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}
                    >
                      +
                    </button>
                  </div>
                  {chartOffset > 0 && (
                    <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setChartOffset(0)}
                        style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
                      >
                        Jump to Latest
                      </button>
                      <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>
                        {chartOffset} candles back
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Clock size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>Loading chart data...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Trading & Trades */}
        <div style={{ width: '360px', background: 'white', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%' }}>
          {/* Trading Panel */}
          <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Multiplier</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setMultiplier(Math.max(1, multiplier - 10))}
                  style={{ width: '36px', height: '36px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={16} />
                </button>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>x{multiplier}</div>
                <button
                  onClick={() => setMultiplier(Math.min(1000, multiplier + 10))}
                  style={{ width: '36px', height: '36px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stake</div>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 10)}
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '16px', fontWeight: '600', outline: 'none' }}
              />
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Commission</span>
                  <span style={{ fontWeight: '600' }}>0.05 USD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Stop out</span>
                  <span style={{ fontWeight: '600' }}>50%</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={takeProfitEnabled} onChange={(e) => setTakeProfitEnabled(e.target.checked)} />
                <span>Take profit</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={stopLossEnabled} onChange={(e) => setStopLossEnabled(e.target.checked)} />
                <span>Stop loss</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => executeTrade('MULTUP')}
                disabled={botActive}
                style={{ 
                  padding: '16px', 
                  background: botActive ? '#D1D5DB' : 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: botActive ? 'not-allowed' : 'pointer', 
                  fontWeight: '700',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: botActive ? 'none' : '0 4px 12px rgba(20,184,166,0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <TrendingUp size={20} />
                Up
              </button>
              <button
                onClick={() => executeTrade('MULTDOWN')}
                disabled={botActive}
                style={{ 
                  padding: '16px', 
                  background: botActive ? '#D1D5DB' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: botActive ? 'not-allowed' : 'pointer', 
                  fontWeight: '700',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: botActive ? 'none' : '0 4px 12px rgba(239,68,68,0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <TrendingDown size={20} />
                Down
              </button>
            </div>

            {botActive && (
              <div style={{ marginTop: '12px', padding: '10px', background: '#FEF3C7', borderRadius: '8px', fontSize: '13px', color: '#92400E', textAlign: 'center', fontWeight: '500' }}>
                Manual trading disabled while bot is active
              </div>
            )}

            <button
              onClick={toggleBot}
              style={{ 
                width: '100%',
                marginTop: '16px',
                padding: '14px', 
                background: botActive ? '#DC2626' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontWeight: '700',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                transition: 'all 0.3s'
              }}
            >
              {botActive ? <StopCircle size={20} /> : <PlayCircle size={20} />}
              {botActive ? 'Stop Bot' : 'Start Bot'}
            </button>
          </div>

          {/* Active Trades */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Active Trades</div>
            </div>
            
            {trades.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                <Activity size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <div style={{ fontSize: '14px' }}>No active trades</div>
              </div>
            ) : (
              <div>
                {trades.slice(0, 10).map(trade => (
                  <div 
                    key={trade.id} 
                    style={{ 
                      padding: '16px 20px', 
                      borderBottom: '1px solid #F3F4F6',
                      background: trade.status === 'won' ? '#F0FDF4' : trade.status === 'lost' ? '#FEF2F2' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{trade.symbol}</div>
                      <div style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontWeight: '600',
                        background: trade.status === 'won' ? '#10B981' : trade.status === 'lost' ? '#EF4444' : '#F59E0B',
                        color: 'white'
                      }}>
                        {trade.status.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                      {trade.type} • {trade.time}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#6B7280' }}>Stake: <strong>{trade.stake.toFixed(2)} USD</strong></span>
                      {trade.profit !== undefined && (
                        <span style={{ color: trade.profit >= 0 ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                          {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)} USD
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Table */}
          <div style={{ borderTop: '1px solid #E5E7EB', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Price History</div>
            </div>
            {priceTable.map((tick, index) => {
              const prevPrice = priceTable[index + 1]?.price;
              const change = prevPrice ? tick.price - prevPrice : 0;
              return (
                <div 
                  key={`${tick.timestamp}-${index}`}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '10px 20px', 
                    fontSize: '13px',
                    borderBottom: '1px solid #F9FAFB',
                    background: index === 0 ? '#FFFBEB' : 'white'
                  }}
                >
                  <span style={{ color: '#6B7280', fontSize: '12px' }}>{tick.time}</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{tick.price.toFixed(2)}</span>
                  {change !== 0 && (
                    <span style={{ 
                      color: change > 0 ? '#10B981' : '#EF4444',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DerivTradingPlatform;