/** Shared between the app and the receipt-reading API route — keep it free of runtime imports. */

export type ReceiptField =
  | 'receiptNumber'
  | 'fullName'
  | 'address'
  | 'birthYear'
  | 'amount'
  | 'amountInWords'
  | 'donationDate'
  | 'note';

/** What the AI read from a receipt photo, before a staff member checks it. */
export type ReceiptExtraction = {
  receiptNumber: string;
  fullName: string;
  address: string;
  birthYear?: number;
  /** VND. */
  amount?: number;
  amountInWords: string;
  /** YYYY-MM-DD, "" when not written (or written in the lunar calendar). */
  donationDate: string;
  note: string;
  /** Fields the reader could not read confidently; the review form highlights them. */
  uncertainFields: ReceiptField[];
};

/** A donation recorded in the ledger ("sổ công đức") after staff confirmation. */
export type Donation = {
  id: string;
  receiptNumber: string;
  fullName: string;
  address: string;
  birthYear?: number;
  amount: number;
  amountInWords: string;
  /** YYYY-MM-DD. */
  donationDate: string;
  note: string;
  /** Local copy of the receipt photo (native only). */
  imageUri?: string;
  /** JSON of the original AI reading, kept to audit corrections. */
  extractionJson?: string;
  /** Staff member who recorded it. */
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type DonationInput = Omit<Donation, 'id' | 'recordedBy' | 'createdAt' | 'updatedAt'>;
