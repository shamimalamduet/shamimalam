
export interface ElectionCenter {
  id: string;
  serialNo: string;
  centerName: string;
  upazila: string;
  union: string;
  type: string;
  riskStatus: string;
  voteCentreType: string;
  totalVoters: string;
  maleVoters: string;
  femaleVoters: string;
  hijraVoters: string;
  officerName: string;
  rank: string;
  phone: string;
  policeTeam: string;
  bgbTeam: string;
  armyTeam: string;
  rabTeam: string;
  magistratePhone: string;
  latitude: string;
  longitude: string;
  mapsUrl: string;
  viewUrl: string;
}

export type SortOption = 'name' | 'serial' | 'risk';
