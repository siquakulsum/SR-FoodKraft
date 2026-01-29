// Pincode lookup utility for Indian postal codes
// This provides a basic lookup for common Indian cities and states

interface PincodeData {
  city: string;
  state: string;
  area?: string;
}

// Basic pincode database for common Indian cities
// In a real application, you would use a proper API like India Post API or similar
const PINCODE_DATABASE: Record<string, PincodeData> = {
  // Tamil Nadu
  '600001': { city: 'Chennai', state: 'Tamil Nadu', area: 'Parrys' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu', area: 'Royapuram' },
  '600003': { city: 'Chennai', state: 'Tamil Nadu', area: 'George Town' },
  '600004': { city: 'Chennai', state: 'Tamil Nadu', area: 'Tondiarpet' },
  '600005': { city: 'Chennai', state: 'Tamil Nadu', area: 'Washermanpet' },
  '600006': { city: 'Chennai', state: 'Tamil Nadu', area: 'Perambur' },
  '600007': { city: 'Chennai', state: 'Tamil Nadu', area: 'Vyasarpadi' },
  '600008': { city: 'Chennai', state: 'Tamil Nadu', area: 'Kilpauk' },
  '600009': { city: 'Chennai', state: 'Tamil Nadu', area: 'Aminjikarai' },
  '600010': { city: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar' },
  '600011': { city: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar West' },
  '600012': { city: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar East' },
  '600013': { city: 'Chennai', state: 'Tamil Nadu', area: 'Shenoy Nagar' },
  '600014': { city: 'Chennai', state: 'Tamil Nadu', area: 'Purasawalkam' },
  '600015': { city: 'Chennai', state: 'Tamil Nadu', area: 'Kellys' },
  '600016': { city: 'Chennai', state: 'Tamil Nadu', area: 'Egmore' },
  '600017': { city: 'Chennai', state: 'Tamil Nadu', area: 'Chetpet' },
  '600018': { city: 'Chennai', state: 'Tamil Nadu', area: 'Nungambakkam' },
  '600019': { city: 'Chennai', state: 'Tamil Nadu', area: 'T. Nagar' },
  '600020': { city: 'Chennai', state: 'Tamil Nadu', area: 'Kodambakkam' },
  '600021': { city: 'Chennai', state: 'Tamil Nadu', area: 'Saidapet' },
  '600022': { city: 'Chennai', state: 'Tamil Nadu', area: 'Guindy' },
  '600023': { city: 'Chennai', state: 'Tamil Nadu', area: 'Adyar' },
  '600024': { city: 'Chennai', state: 'Tamil Nadu', area: 'Thiruvanmiyur' },
  '600025': { city: 'Chennai', state: 'Tamil Nadu', area: 'Besant Nagar' },
  '600026': { city: 'Chennai', state: 'Tamil Nadu', area: 'Indira Nagar' },
  '600027': { city: 'Chennai', state: 'Tamil Nadu', area: 'Kotturpuram' },
  '600028': { city: 'Chennai', state: 'Tamil Nadu', area: 'Mylapore' },
  '600029': { city: 'Chennai', state: 'Tamil Nadu', area: 'Mandaveli' },
  '600030': { city: 'Chennai', state: 'Tamil Nadu', area: 'Foreshore Estate' },
  '600031': { city: 'Chennai', state: 'Tamil Nadu', area: 'Triplicane' },
  '600032': { city: 'Chennai', state: 'Tamil Nadu', area: 'Chepauk' },
  '600033': { city: 'Chennai', state: 'Tamil Nadu', area: 'Marina Beach' },
  '600034': { city: 'Chennai', state: 'Tamil Nadu', area: 'Royapettah' },
  '600035': { city: 'Chennai', state: 'Tamil Nadu', area: 'Mylapore' },
  '600036': { city: 'Chennai', state: 'Tamil Nadu', area: 'Luz Church Road' },
  '600037': { city: 'Chennai', state: 'Tamil Nadu', area: 'Alwarpet' },
  '600038': { city: 'Chennai', state: 'Tamil Nadu', area: 'Teynampet' },
  '600039': { city: 'Chennai', state: 'Tamil Nadu', area: 'Nandanam' },
  '600040': { city: 'Chennai', state: 'Tamil Nadu', area: 'Taramani' },
  '600041': { city: 'Chennai', state: 'Tamil Nadu', area: 'Thoraipakkam' },
  '600042': { city: 'Chennai', state: 'Tamil Nadu', area: 'Sholinganallur' },
  '600043': { city: 'Chennai', state: 'Tamil Nadu', area: 'Medavakkam' },
  '600044': { city: 'Chennai', state: 'Tamil Nadu', area: 'Pallikaranai' },
  '600045': { city: 'Chennai', state: 'Tamil Nadu', area: 'Velachery' },
  '600046': { city: 'Chennai', state: 'Tamil Nadu', area: 'Tambaram' },
  '600047': { city: 'Chennai', state: 'Tamil Nadu', area: 'Chromepet' },
  '600048': { city: 'Chennai', state: 'Tamil Nadu', area: 'Pallavaram' },
  '600049': { city: 'Chennai', state: 'Tamil Nadu', area: 'St. Thomas Mount' },
  '600050': { city: 'Chennai', state: 'Tamil Nadu', area: 'Guindy' },
  '600051': { city: 'Chennai', state: 'Tamil Nadu', area: 'Ashok Nagar' },
  '600052': { city: 'Chennai', state: 'Tamil Nadu', area: 'K.K. Nagar' },
  '600053': { city: 'Chennai', state: 'Tamil Nadu', area: 'West Mambalam' },
  '600054': { city: 'Chennai', state: 'Tamil Nadu', area: 'Saidapet' },
  '600055': { city: 'Chennai', state: 'Tamil Nadu', area: 'Guindy' },
  '600056': { city: 'Chennai', state: 'Tamil Nadu', area: 'Velachery' },
  '600057': { city: 'Chennai', state: 'Tamil Nadu', area: 'Thoraipakkam' },
  '600058': { city: 'Chennai', state: 'Tamil Nadu', area: 'Sholinganallur' },
  '600059': { city: 'Chennai', state: 'Tamil Nadu', area: 'Medavakkam' },
  '600060': { city: 'Chennai', state: 'Tamil Nadu', area: 'Pallikaranai' },

  // Other major cities
  '110001': { city: 'New Delhi', state: 'Delhi', area: 'Connaught Place' },
  '110002': { city: 'New Delhi', state: 'Delhi', area: 'Daryaganj' },
  '110003': { city: 'New Delhi', state: 'Delhi', area: 'India Gate' },
  '400001': { city: 'Mumbai', state: 'Maharashtra', area: 'Fort' },
  '400002': { city: 'Mumbai', state: 'Maharashtra', area: 'Marine Lines' },
  '400003': { city: 'Mumbai', state: 'Maharashtra', area: 'Churchgate' },
  '560001': { city: 'Bangalore', state: 'Karnataka', area: 'Bangalore GPO' },
  '560002': { city: 'Bangalore', state: 'Karnataka', area: 'Bangalore City' },
  '700001': { city: 'Kolkata', state: 'West Bengal', area: 'BBD Bagh' },
  '700002': { city: 'Kolkata', state: 'West Bengal', area: 'Dalhousie' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', area: 'Ahmedabad GPO' },
  '380002': { city: 'Ahmedabad', state: 'Gujarat', area: 'Ellis Bridge' },
  '500001': { city: 'Hyderabad', state: 'Telangana', area: 'Abids' },
  '500002': { city: 'Hyderabad', state: 'Telangana', area: 'Nampally' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', area: 'Parrys' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu', area: 'Royapuram' },
};

export const lookupPincode = async (pincode: string): Promise<PincodeData | null> => {
  // Clean the pincode (remove spaces, non-digits)
  const cleanPincode = pincode.replace(/\D/g, '');

  // Check if pincode is 6 digits
  if (cleanPincode.length !== 6) {
    return null;
  }

  // Look up in our database
  const result = PINCODE_DATABASE[cleanPincode];

  if (result) {
    return result;
  }

  // If not found in our database, you could make an API call here
  // For example, using India Post API or similar service
  try {
    // Example API call (uncomment and configure as needed)
    /*
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`);
    const data = await response.json();
    
    if (data && data[0] && data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.District,
        state: postOffice.State,
        area: postOffice.Name
      };
    }
    */
  } catch (error) {
    console.error('Error fetching pincode data:', error);
  }

  return null;
};

export const validatePincode = (pincode: string): boolean => {
  const cleanPincode = pincode.replace(/\D/g, '');
  return cleanPincode.length === 6;
};

