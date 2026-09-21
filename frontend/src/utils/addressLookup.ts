/**
 * Built-in Indian Postal / Location mapping for instantaneous (0ms) auto-fill.
 * Also provides an optional network-based refinement for specific post offices.
 */

export interface LocationLookupResult {
  city?: string;
  state?: string;
  country: string;
}

// 3-digit PIN code prefix to City & State
const PIN_PREFIX_3_MAP: Record<string, { city: string; state: string }> = {
  // Kerala (670xxx - 695xxx)
  '682': { city: 'Kochi', state: 'Kerala' },
  '683': { city: 'Aluva', state: 'Kerala' },
  '680': { city: 'Thrissur', state: 'Kerala' },
  '673': { city: 'Kozhikode', state: 'Kerala' },
  '695': { city: 'Thiruvananthapuram', state: 'Kerala' },
  '686': { city: 'Kottayam', state: 'Kerala' },
  '691': { city: 'Kollam', state: 'Kerala' },
  '678': { city: 'Palakkad', state: 'Kerala' },
  '676': { city: 'Malappuram', state: 'Kerala' },
  '670': { city: 'Kannur', state: 'Kerala' },
  '688': { city: 'Alappuzha', state: 'Kerala' },
  '671': { city: 'Kasaragod', state: 'Kerala' },
  '685': { city: 'Idukki', state: 'Kerala' },
  '689': { city: 'Pathanamthitta', state: 'Kerala' },
  '679': { city: 'Ottapalam', state: 'Kerala' },

  // Karnataka (560xxx - 591xxx)
  '560': { city: 'Bengaluru', state: 'Karnataka' },
  '561': { city: 'Bengaluru Rural', state: 'Karnataka' },
  '562': { city: 'Bengaluru Rural', state: 'Karnataka' },
  '570': { city: 'Mysuru', state: 'Karnataka' },
  '575': { city: 'Mangaluru', state: 'Karnataka' },
  '580': { city: 'Hubballi', state: 'Karnataka' },
  '581': { city: 'Dharwad', state: 'Karnataka' },
  '590': { city: 'Belagavi', state: 'Karnataka' },
  '577': { city: 'Shivamogga', state: 'Karnataka' },
  '572': { city: 'Tumakuru', state: 'Karnataka' },

  // Tamil Nadu (600xxx - 643xxx)
  '600': { city: 'Chennai', state: 'Tamil Nadu' },
  '641': { city: 'Coimbatore', state: 'Tamil Nadu' },
  '625': { city: 'Madurai', state: 'Tamil Nadu' },
  '620': { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  '636': { city: 'Salem', state: 'Tamil Nadu' },
  '632': { city: 'Vellore', state: 'Tamil Nadu' },
  '627': { city: 'Tirunelveli', state: 'Tamil Nadu' },
  '638': { city: 'Erode', state: 'Tamil Nadu' },
  '642': { city: 'Pollachi', state: 'Tamil Nadu' },
  '605': { city: 'Puducherry', state: 'Puducherry' },

  // Maharashtra (400xxx - 445xxx)
  '400': { city: 'Mumbai', state: 'Maharashtra' },
  '401': { city: 'Thane', state: 'Maharashtra' },
  '411': { city: 'Pune', state: 'Maharashtra' },
  '440': { city: 'Nagpur', state: 'Maharashtra' },
  '422': { city: 'Nashik', state: 'Maharashtra' },
  '431': { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra' },
  '416': { city: 'Kolhapur', state: 'Maharashtra' },
  '413': { city: 'Solapur', state: 'Maharashtra' },

  // Telangana & Andhra Pradesh (500xxx - 535xxx)
  '500': { city: 'Hyderabad', state: 'Telangana' },
  '501': { city: 'Ranga Reddy', state: 'Telangana' },
  '506': { city: 'Warangal', state: 'Telangana' },
  '530': { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  '520': { city: 'Vijayawada', state: 'Andhra Pradesh' },
  '522': { city: 'Guntur', state: 'Andhra Pradesh' },
  '517': { city: 'Tirupati', state: 'Andhra Pradesh' },
  '515': { city: 'Anantapur', state: 'Andhra Pradesh' },

  // Delhi (110xxx)
  '110': { city: 'New Delhi', state: 'Delhi' },

  // Haryana (121xxx - 136xxx)
  '122': { city: 'Gurugram', state: 'Haryana' },
  '121': { city: 'Faridabad', state: 'Haryana' },
  '132': { city: 'Karnal', state: 'Haryana' },
  '133': { city: 'Ambala', state: 'Haryana' },
  '134': { city: 'Panchkula', state: 'Haryana' },

  // Uttar Pradesh (201xxx - 285xxx)
  '201': { city: 'Noida', state: 'Uttar Pradesh' },
  '226': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '208': { city: 'Kanpur', state: 'Uttar Pradesh' },
  '282': { city: 'Agra', state: 'Uttar Pradesh' },
  '221': { city: 'Varanasi', state: 'Uttar Pradesh' },
  '211': { city: 'Prayagraj', state: 'Uttar Pradesh' },
  '250': { city: 'Meerut', state: 'Uttar Pradesh' },
  '243': { city: 'Bareilly', state: 'Uttar Pradesh' },

  // West Bengal (700xxx - 743xxx)
  '700': { city: 'Kolkata', state: 'West Bengal' },
  '711': { city: 'Howrah', state: 'West Bengal' },
  '734': { city: 'Siliguri', state: 'West Bengal' },
  '713': { city: 'Durgapur', state: 'West Bengal' },

  // Gujarat (380xxx - 396xxx)
  '380': { city: 'Ahmedabad', state: 'Gujarat' },
  '395': { city: 'Surat', state: 'Gujarat' },
  '390': { city: 'Vadodara', state: 'Gujarat' },
  '360': { city: 'Rajkot', state: 'Gujarat' },
  '382': { city: 'Gandhinagar', state: 'Gujarat' },

  // Rajasthan (301xxx - 345xxx)
  '302': { city: 'Jaipur', state: 'Rajasthan' },
  '342': { city: 'Jodhpur', state: 'Rajasthan' },
  '313': { city: 'Udaipur', state: 'Rajasthan' },
  '324': { city: 'Kota', state: 'Rajasthan' },
  '305': { city: 'Ajmer', state: 'Rajasthan' },

  // Punjab & Chandigarh (140xxx - 160xxx)
  '160': { city: 'Chandigarh', state: 'Chandigarh' },
  '141': { city: 'Ludhiana', state: 'Punjab' },
  '143': { city: 'Amritsar', state: 'Punjab' },
  '144': { city: 'Jalandhar', state: 'Punjab' },
  '147': { city: 'Patiala', state: 'Punjab' },

  // Madhya Pradesh (450xxx - 488xxx)
  '452': { city: 'Indore', state: 'Madhya Pradesh' },
  '462': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '474': { city: 'Gwalior', state: 'Madhya Pradesh' },
  '482': { city: 'Jabalpur', state: 'Madhya Pradesh' },

  // Bihar & Jharkhand (800xxx - 855xxx)
  '800': { city: 'Patna', state: 'Bihar' },
  '823': { city: 'Gaya', state: 'Bihar' },
  '834': { city: 'Ranchi', state: 'Jharkhand' },
  '831': { city: 'Jamshedpur', state: 'Jharkhand' },
  '826': { city: 'Dhanbad', state: 'Jharkhand' },

  // Odisha (751xxx - 770xxx)
  '751': { city: 'Bhubaneswar', state: 'Odisha' },
  '753': { city: 'Cuttack', state: 'Odisha' },
  '769': { city: 'Rourkela', state: 'Odisha' },

  // Assam & North East (781xxx - 799xxx)
  '781': { city: 'Guwahati', state: 'Assam' },
  '799': { city: 'Agartala', state: 'Tripura' },
  '793': { city: 'Shillong', state: 'Meghalaya' },
  '795': { city: 'Imphal', state: 'Manipur' },

  // Goa (403xxx)
  '403': { city: 'Panaji', state: 'Goa' },

  // Uttarakhand (248xxx - 263xxx)
  '248': { city: 'Dehradun', state: 'Uttarakhand' },
  '249': { city: 'Haridwar', state: 'Uttarakhand' },

  // Himachal Pradesh (171xxx - 177xxx)
  '171': { city: 'Shimla', state: 'Himachal Pradesh' },
  '176': { city: 'Dharamshala', state: 'Himachal Pradesh' },
};

// 2-digit PIN code prefix fallback to State
const PIN_PREFIX_2_MAP: Record<string, string> = {
  '11': 'Delhi',
  '12': 'Haryana',
  '13': 'Haryana',
  '14': 'Punjab',
  '15': 'Punjab',
  '16': 'Chandigarh',
  '17': 'Himachal Pradesh',
  '18': 'Jammu and Kashmir',
  '19': 'Jammu and Kashmir',
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '23': 'Uttar Pradesh',
  '24': 'Uttar Pradesh',
  '25': 'Uttar Pradesh',
  '26': 'Uttar Pradesh',
  '27': 'Uttar Pradesh',
  '28': 'Uttar Pradesh',
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',
  '40': 'Maharashtra',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  '49': 'Chhattisgarh',
  '50': 'Telangana',
  '51': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',
  '70': 'West Bengal',
  '71': 'West Bengal',
  '72': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Odisha',
  '78': 'Assam',
  '79': 'North Eastern States',
  '80': 'Bihar',
  '81': 'Bihar',
  '82': 'Jharkhand',
  '83': 'Jharkhand',
  '84': 'Bihar',
  '85': 'Bihar',
};

// Common Indian City to State mapping
const CITY_TO_STATE_MAP: Record<string, string> = {
  // Kerala
  kochi: 'Kerala',
  cochin: 'Kerala',
  ernakulam: 'Kerala',
  thiruvananthapuram: 'Kerala',
  trivandrum: 'Kerala',
  kozhikode: 'Kerala',
  calicut: 'Kerala',
  thrissur: 'Kerala',
  kollam: 'Kerala',
  kottayam: 'Kerala',
  palakkad: 'Kerala',
  alappuzha: 'Kerala',
  alleppey: 'Kerala',
  kannur: 'Kerala',
  malappuram: 'Kerala',
  kasaragod: 'Kerala',
  pathanamthitta: 'Kerala',
  idukki: 'Kerala',
  wayanad: 'Kerala',

  // Karnataka
  bengaluru: 'Karnataka',
  bangalore: 'Karnataka',
  mysuru: 'Karnataka',
  mysore: 'Karnataka',
  mangaluru: 'Karnataka',
  mangalore: 'Karnataka',
  hubballi: 'Karnataka',
  hubli: 'Karnataka',
  belagavi: 'Karnataka',
  belgaum: 'Karnataka',
  shivamogga: 'Karnataka',
  tumakuru: 'Karnataka',

  // Tamil Nadu
  chennai: 'Tamil Nadu',
  madras: 'Tamil Nadu',
  coimbatore: 'Tamil Nadu',
  madurai: 'Tamil Nadu',
  tiruchirappalli: 'Tamil Nadu',
  trichy: 'Tamil Nadu',
  salem: 'Tamil Nadu',
  tirunelveli: 'Tamil Nadu',
  vellore: 'Tamil Nadu',
  erode: 'Tamil Nadu',
  thanjavur: 'Tamil Nadu',

  // Maharashtra
  mumbai: 'Maharashtra',
  bombay: 'Maharashtra',
  pune: 'Maharashtra',
  nagpur: 'Maharashtra',
  nashik: 'Maharashtra',
  thane: 'Maharashtra',
  'navi mumbai': 'Maharashtra',
  kolhapur: 'Maharashtra',
  aurangabad: 'Maharashtra',
  solapur: 'Maharashtra',

  // Telangana & Andhra Pradesh
  hyderabad: 'Telangana',
  secunderabad: 'Telangana',
  warangal: 'Telangana',
  visakhapatnam: 'Andhra Pradesh',
  vizag: 'Andhra Pradesh',
  vijayawada: 'Andhra Pradesh',
  guntur: 'Andhra Pradesh',
  tirupati: 'Andhra Pradesh',
  kurnool: 'Andhra Pradesh',

  // Delhi & NCR
  delhi: 'Delhi',
  'new delhi': 'Delhi',
  noida: 'Uttar Pradesh',
  'greater noida': 'Uttar Pradesh',
  gurugram: 'Haryana',
  gurgaon: 'Haryana',
  faridabad: 'Haryana',
  ghaziabad: 'Uttar Pradesh',

  // West Bengal
  kolkata: 'West Bengal',
  calcutta: 'West Bengal',
  howrah: 'West Bengal',
  siliguri: 'West Bengal',
  durgapur: 'West Bengal',

  // Gujarat
  ahmedabad: 'Gujarat',
  surat: 'Gujarat',
  vadodara: 'Gujarat',
  baroda: 'Gujarat',
  rajkot: 'Gujarat',
  gandhinagar: 'Gujarat',

  // Rajasthan
  jaipur: 'Rajasthan',
  jodhpur: 'Rajasthan',
  udaipur: 'Rajasthan',
  kota: 'Rajasthan',
  ajmer: 'Rajasthan',

  // Punjab, Haryana & Chandigarh
  chandigarh: 'Chandigarh',
  mohali: 'Punjab',
  panchkula: 'Haryana',
  ludhiana: 'Punjab',
  amritsar: 'Punjab',
  jalandhar: 'Punjab',

  // Madhya Pradesh
  indore: 'Madhya Pradesh',
  bhopal: 'Madhya Pradesh',
  gwalior: 'Madhya Pradesh',
  jabalpur: 'Madhya Pradesh',

  // Uttar Pradesh
  lucknow: 'Uttar Pradesh',
  kanpur: 'Uttar Pradesh',
  agra: 'Uttar Pradesh',
  varanasi: 'Uttar Pradesh',
  prayagraj: 'Uttar Pradesh',
  allahabad: 'Uttar Pradesh',

  // Others
  patna: 'Bihar',
  ranchi: 'Jharkhand',
  jamshedpur: 'Jharkhand',
  bhubaneswar: 'Odisha',
  cuttack: 'Odisha',
  guwahati: 'Assam',
  dehradun: 'Uttarakhand',
  shimla: 'Himachal Pradesh',
  panaji: 'Goa',
  goa: 'Goa',
  puducherry: 'Puducherry',
};

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
];

/**
 * Instantly lookup location details by 6-digit Indian PIN code.
 */
export function lookupByPincode(pin: string): LocationLookupResult | null {
  const cleaned = (pin || '').replace(/\D/g, '');
  if (cleaned.length !== 6) return null;

  const prefix3 = cleaned.slice(0, 3);
  if (PIN_PREFIX_3_MAP[prefix3]) {
    return {
      city: PIN_PREFIX_3_MAP[prefix3].city,
      state: PIN_PREFIX_3_MAP[prefix3].state,
      country: 'India',
    };
  }

  const prefix2 = cleaned.slice(0, 2);
  if (PIN_PREFIX_2_MAP[prefix2]) {
    return {
      state: PIN_PREFIX_2_MAP[prefix2],
      country: 'India',
    };
  }

  return { country: 'India' };
}

/**
 * Lookup state and country by city name.
 */
export function lookupByCity(cityName: string): LocationLookupResult | null {
  const key = (cityName || '').trim().toLowerCase();
  if (!key) return null;

  if (CITY_TO_STATE_MAP[key]) {
    return {
      state: CITY_TO_STATE_MAP[key],
      country: 'India',
    };
  }

  return null;
}

/**
 * Validate whether a string is an Indian State.
 */
export function isIndianState(stateName: string): boolean {
  const key = (stateName || '').trim().toLowerCase();
  if (!key) return false;
  return INDIAN_STATES.some((s) => s.toLowerCase() === key);
}

/**
 * Optional network refinement with a strict 2-second timeout so it never hangs.
 */
export async function fetchPincodeOnline(pin: string, signal?: AbortSignal): Promise<{ city?: string; state?: string } | null> {
  const cleaned = (pin || '').replace(/\D/g, '');
  if (cleaned.length !== 6) return null;

  const timeoutCtrl = new AbortController();
  const timer = setTimeout(() => timeoutCtrl.abort(), 2000);

  const combinedSignal = signal || timeoutCtrl.signal;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`, {
      signal: combinedSignal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.Status === 'Success') {
      const po = data[0].PostOffice?.[0];
      if (po) {
        return {
          city: po.District || po.Block || po.Name,
          state: po.State,
        };
      }
    }
  } catch {
    // Graceful fallback to instant local lookup
  } finally {
    clearTimeout(timer);
  }

  return null;
}
