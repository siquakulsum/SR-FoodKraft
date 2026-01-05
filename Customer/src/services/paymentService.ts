// Dummy Payment Service - Simulates Stripe-like payment processing

export interface EmiDetails {
  provider: string;
  tenure: number;
}

export interface WalletDetails {
  provider: string;
}


export interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'emi' | 'wallet' | 'cod';
  details: CardDetails | UpiDetails | NetBankingDetails | EmiDetails | WalletDetails | CodDetails;
}

export interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export interface UpiDetails {
  upiId?: string;
  qrCode?: boolean;
}

export interface NetBankingDetails {
  bank: string;
  accountNumber: string;
}

export interface CodDetails {
  // Cash on Delivery - no additional details needed
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  paymentMethod: string;
  amount: number;
  timestamp: string;
}

// Simulate payment processing delay
const simulateProcessing = (ms: number = 2000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate dummy transaction ID
const generateTransactionId = () => 
  `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Validate card details
const validateCard = (card: CardDetails): string | null => {
  if (!card.number || card.number.replace(/\s/g, '').length < 16) {
    return 'Invalid card number';
  }
  if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) {
    return 'Invalid expiry date (MM/YY)';
  }
  if (!card.cvv || card.cvv.length < 3) {
    return 'Invalid CVV';
  }
  if (!card.name || card.name.trim().length < 2) {
    return 'Invalid cardholder name';
  }
  return null;
};

// Validate UPI ID
const validateUpi = (upi: UpiDetails): string | null => {
  if (upi.qrCode) {
    // QR code payment doesn't need UPI ID validation
    return null;
  }
  if (!upi.upiId || !upi.upiId.includes('@')) {
    return 'Invalid UPI ID';
  }
  return null;
};

// Validate net banking
const validateNetBanking = (netbanking: NetBankingDetails): string | null => {
  if (!netbanking.bank) {
    return 'Please select a bank';
  }
  if (!netbanking.accountNumber || netbanking.accountNumber.length < 8) {
    return 'Invalid account number';
  }
  return null;
};

// Validate EMI
const validateEmi = (emi: EmiDetails): string | null => {
  // EMI doesn't require strict validation - user can proceed with default values
  return null;
};

// Validate wallet
const validateWallet = (wallet: WalletDetails): string | null => {
  // Wallet doesn't require strict validation - user can proceed without selecting provider
  return null;
};


// Simulate payment processing
export const processPayment = async (
  paymentMethod: PaymentMethod,
  amount: number
): Promise<PaymentResult> => {
  try {
    // Simulate processing delay
    await simulateProcessing(2000);

    // Validate payment method
    let validationError: string | null = null;
    
    switch (paymentMethod.type) {
      case 'card':
        validationError = validateCard(paymentMethod.details as CardDetails);
        break;
      case 'upi':
        validationError = validateUpi(paymentMethod.details as UpiDetails);
        break;
      case 'netbanking':
        validationError = validateNetBanking(paymentMethod.details as NetBankingDetails);
        break;
      case 'emi':
        validationError = validateEmi(paymentMethod.details as EmiDetails);
        break;
      case 'wallet':
        validationError = validateWallet(paymentMethod.details as WalletDetails);
        break;
      case 'cod':
        // COD doesn't need validation
        break;
    }

    if (validationError) {
      return {
        success: false,
        error: validationError,
        paymentMethod: paymentMethod.type,
        amount,
        timestamp: new Date().toISOString()
      };
    }

    // Simulate random payment failures (5% chance)
    const isFailure = Math.random() < 0.05;
    
    if (isFailure) {
      const failureReasons = [
        'Insufficient funds',
        'Card declined by bank',
        'Network timeout',
        'Invalid payment details',
        'Payment gateway error'
      ];
      
      return {
        success: false,
        error: failureReasons[Math.floor(Math.random() * failureReasons.length)],
        paymentMethod: paymentMethod.type,
        amount,
        timestamp: new Date().toISOString()
      };
    }

    // Successful payment
    return {
      success: true,
      transactionId: generateTransactionId(),
      paymentMethod: paymentMethod.type,
      amount,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: 'Payment processing failed. Please try again.',
      paymentMethod: paymentMethod.type,
      amount,
      timestamp: new Date().toISOString()
    };
  }
};

// Get available banks for net banking
export const getAvailableBanks = () => [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Indian Bank'
];

// Format card number with spaces
export const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

// Format expiry date
export const formatExpiryDate = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

// Generate QR code data for UPI payment
export const generateUpiQrData = (amount: number, merchantId: string = 'srfoodkraft@paytm') => {
  return `upi://pay?pa=${merchantId}&pn=SR%20Food%20Kraft&am=${amount}&cu=INR&tn=Food%20Order%20Payment`;
};
