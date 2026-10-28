export interface Clinic {
    id: string,
    name: string,
    addressLine1: string,
    addressLine2: string | null,
    city: string,
    postCode: string | null,
    phoneNumber: string | null,
    email: string | null,
    active: boolean,
    createdAt: string,
    updatedAt: string
}


export interface ClinicRequest {
    name: string,
    addressLine1: string,
    addressLine2?: string,
    city: string,
    postCode?: string,
    phoneNumber?: string,
    email?: string
}