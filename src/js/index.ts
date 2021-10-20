import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index"

interface ICurrencies {
    name: string
    code: string
    isoNumber: string
}

interface ICustomer {
    customerNumber: number
    currency: string
    customerGroup: object
    address: string
    city: string
    country: string
    email: string
    name: string
    vatZone: object
    zip: string
}

interface ICollection {
    collection: Array<ICustomer>
}

class Customer implements ICustomer {
    customerNumber: number = 0;
    address: string = '';
    city: string = '';
    country: string = '';
    email: string = '';
    name: string = '';
    zip: string = '';
  
    constructor(options: ICustomer) {
      Object.assign(this, options);
    }
}
  
class Customers {
    customers: Customer[] = [];
  
    constructor(options: ICollection) {
      Object.assign(this.customers, options.customers.map(customer => new Customer(customer));
    }
  
    getCustomers(): Customer[] {
      return this.customers;
    }
}

interface ICustomerGroups {
    customerGroupNumber: number
    name: string
    account: object
}

interface IDraftsInvoices {
    draftInvoiceNumber: number
    date: string
    currency: string
    exchangeRate: number
    netAmount: number
    netAmountInBaseCurrency: number
    grossAmount: number
    grossAmountInBaseCurrency: number
    vatAmount: number
    roundingAmount: number
    costPriceInBaseCurrency: number
    dueDate: string
    paymentTerms: object
    customer: object
    recipient: object
    layout: object
}

interface IBookedInvoices {
    bookedInvoiceNumber: number
    date: string
    currency: string
    exchangeRate: number
    netAmount: number
    netAmountInBaseCurrency: number
    grossAmount: number
    grossAmountInBaseCurrency: number
    vatAmount: number
    roundingAmount: number
    remainder: number
    remainderInBaseCurrency: number
    dueDate: string
    paymentTerms: object
    customer: object
    layout: object
}

interface IEmployees {
    employeeNumber: number
    name: string
    email: string
    phone: string
    barred: boolean
}

interface ILayouts {
    layoutNumber: number
    name: string
    deleted: boolean
}

interface IPaymentTerms {
    paymentTermsNumber: number
    daysOfCredit: number
    description: string
    name: string
    percentageForPrepaidAmount: number
    percentageForRemainderAmount: number
}

interface IProductGroups {
    productGroupNumber: number
    name: string
    inventoryEnabled: boolean
}

interface IProduct {
    productNumber: number
    description: string
    name: string
    costPrice: number
    productGroup: object
    recommendedPrice: number
    salesPrice: number
    barCode: string
    barred: boolean
    lastUpdated: string
}

//interface ISupplier {
    //address: string
    //bankAccount: string
    //barred: boolean
    //city: string
    //contacts: string
    //corporateIdentificationNumber: string
    //country: string
    //currency: string
    //defaultInvoiceText: string
    //email: string
    //name: string
    //phone: string
    //supplierNumber: number
    //zip: string
    //self: string
//}

interface IUnit {
    unitNumber: number
    name: string
}

let baseUrl: string = "https://restapi.e-conomic.com"

new Vue({
    // TypeScript compiler complains about Vue because the CDN link to Vue is in the html file.
    // Before the application runs this TypeScript file will be compiled into bundle.js
    // which is included at the bottom of the html file.
    el: "#app",
    data: {
        currencies: [],
        currenciesGetByCode: "",
        singleCurrency: null,

        collection: [],
        customers: [],
        customerNumberToGetBy: 0,
        singleCustomer: null,
        updateCustomerData: {customerNumber: 0, currency: "", address: "", city: "", country: "", email: "", customerGroup: {customerGroupNumber: 0}, name: "", zip: "", paymentTerms: {paymentTermsNumber: 0}, vatZone: {vatZoneNumber: 0}},

        customerGroupGetByNumber: 0,
        singleCustomerGroup: null,

        draftsInvoiceNumberToGetBy: 0,
        singleDraftsInvoice: null,
        addDraftsInvoiceData: {date: "", currency: "", paymentTerms: {paymentTermsNumber: 0, daysOfCredit: 0}, customer: {customerNumber: 0}, recipient: {name: "", address: "", zip: "", city: "", vatZone: {name: "", vatZoneNumber: 0}}, layout: {layoutNumber: 0}},
        addMessage: "",
        updateDraftInvoiceData: {draftInvoiceNumber: 0, date: "", currency: "", paymentTerms: {paymentTermsNumber: 0, daysOfCredit: 0}, customer: {customerNumber: 0}, recipient: {name: "", address: "", zip: "", city: "", vatZone: {name: "", vatZoneNumber: 0}}, layout: {layoutNumber: 0}},

        bookedInvoiceNumberToGetBy: 0,
        singleBookedInvoice: null,

        employeeByNumber: 0,
        singleEmployee: null,

        layoutByNumber: 0,
        singleLayout: null,

        paymentTermsByNumber: 0,
        singlePaymentTerm: null,

        productGroupByNumber: 0,
        singleProductGroup: null,

        productByNumber: 0,
        singleProduct: null,

        //supplierByNumber: 0,
        //singleSupplier: null

        unitGetByNumber: 0,
        singleUnit: null,

        updateMessage: "",
    },
    // Når data fra en anden HTML-side bliver transporteret til dette program, så bliver kun det der nævnes nedenunder tilføjet til et felt på HTML-siden. 
    // Dog selvom den virker, så virker den ikke til de andre metoder af en eller anden grund.
    created() {
        let params = new URLSearchParams(location.search);
        this.updateDraftInvoiceData.draftInvoiceNumber = params.get('draftInvoiceNumber')
        this.updateDraftInvoiceData.date = params.get('date')
        this.updateDraftInvoiceData.currency = params.get('currency')
        this.updateDraftInvoiceData.paymentTerms.paymentTermsNumber = params.get('paymentTermsNumber')
        this.updateDraftInvoiceData.paymentTerms.daysOfCredit = params.get('daysOfCredit')
        this.updateDraftInvoiceData.customer.customerNumber = params.get('customerNumber')
        this.updateDraftInvoiceData.recipient.name = params.get('name')
        this.updateDraftInvoiceData.recipient.address = params.get('address')
        this.updateDraftInvoiceData.recipient.zip = params.get('zip')
        this.updateDraftInvoiceData.recipient.city = params.get('city')
        this.updateDraftInvoiceData.recipient.vatZone.name = params.get('vatZoneName')
        this.updateDraftInvoiceData.recipient.vatZone.vatZoneNumber = params.get('vatZoneNumber')
        this.updateDraftInvoiceData.layout.layoutNumber = params.get('layoutNumber')
    },
    methods: {
        // Gør det nemmere for Get metoder at vise værdierne, hvor den bruger axios' get-metode og URL'en.
        // Dog den kan ikke vise værdier i felterne på HTML-siden, fordi de er sat ind i collection, så den virker ikke indtil videre.
        helperGetAndShow(url: string) {
            axios.get<ICollection[]>(url)
                .then((response: AxiosResponse<ICollection[]>) => {
                    this.collection = response.data
                    console.log(this.collection)
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
            //axios.get<ICustomer[]>(url)
                //.then((response) => {
                    //const customers: Customers = new Customer(response.data);
                    //const list = customers.getCustomers();
                    //console.log(this.customers)
                //})
                //.catch((error: AxiosError) => {
                    //this.message = error.message
                    //alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                //})
        },
        // Får fat i alle kunder, men virker ikke lige nu.
        getAllCustomers() {
            console.log("getAllCustomers")
            this.helperGetAndShow(baseUrl + "/customers?demo=true")
        },
        // Henter en kunde via id, og headeren nedenunder bruges til at få adgang til Vismas restapi.
        getByCustomerId(customerNumber: number) {
            let url: string = baseUrl + "/customers" + "/" + customerNumber
            axios.get<ICustomer>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<ICustomer>) => {
                    this.singleCustomer = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Opdatere en kunde via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        updateCustomer() {
            let url: string = baseUrl + "/customers/" + this.updateCustomerData.customerNumber
            axios.put<ICustomer>(url, this.updateCustomerData, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse) => {
                    let message: string = response.statusText + " kunden er opdateret."
                    this.updateMessage = message
                })
                .catch((error: AxiosError) => {
                    // this.addMessage = error.message
                    alert(error.message)
                })
        },
        // Henter en valuta via kode, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByCode(code: string) {
            let url: string = baseUrl + "/currencies" + "/" + code
            axios.get<ICurrencies>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<ICurrencies>) => {
                    this.singleCurrency = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Henter en kundegruppe via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByCustomerGroupNumber(customerGroupNumber: number) {
            let url: string = baseUrl + "/customer-groups" + "/" + customerGroupNumber
            axios.get<ICustomerGroups>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<ICustomerGroups>) => {
                    this.singleCustomerGroup = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Henter en bogført faktura via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByDraftInvoiceNumber(draftInvoiceNumber: number) {
            let url: string = baseUrl + "/invoices/drafts" + "/" + draftInvoiceNumber
            axios.get<IDraftsInvoices>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<IDraftsInvoices>) => {
                    this.singleDraftsInvoice = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Skaber en bogført faktura, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        addDraftsInvoice() {
            axios.post<IDraftsInvoices>(baseUrl + "/invoices/drafts", this.addDraftsInvoiceData, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse) => {
                    
                    let message: string = "Skabningen af ny udarbejdet faktura er " + response.statusText
                    this.addMessage = message
                })
                .catch((error: AxiosError) => {
                    // this.addMessage = error.message
                    alert(error.message)
                })
        },
        // Opdatere en bogført faktura via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        updateDraftInvoice() {
            let url: string = baseUrl + "/invoices/drafts/" + this.updateDraftInvoiceData.draftInvoiceNumber
            axios.put<IDraftsInvoices>(url, this.updateDraftInvoiceData, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse) => {
                    let message: string = response.statusText + " fakturan er opdateret."
                    this.updateMessage = message
                })
                .catch((error: AxiosError) => {
                    // this.addMessage = error.message
                    alert(error.message)
                })
        },
        // Henter en aftalt faktura via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByBookedInvoiceNumber(bookedInvoiceNumber: number) {
            let url: string = baseUrl + "/invoices/booked" + "/" + bookedInvoiceNumber
            axios.get<IBookedInvoices>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<IBookedInvoices>) => {
                    this.singleBookedInvoice = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Henter en arbejder via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByEmployeeNumber(employeeNumber: number) {
            let url: string = baseUrl + "/employees" + "/" + employeeNumber
            axios.get<IEmployees>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<IEmployees>) => {
                    this.singleEmployee = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Henter en layout via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByLayoutNumber(layoutNumber: number) {
            let url: string = baseUrl + "/layouts" + "/" + layoutNumber
            axios.get<ILayouts>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<ILayouts>) => {
                    this.singleLayout = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Henter en betalingsbetingelse via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByPaymentTermsNumber(paymentTermsNumber: number) {
            let url: string = baseUrl + "/payment-terms" + "/" + paymentTermsNumber
            axios.get<IPaymentTerms>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<IPaymentTerms>) => {
                    this.singlePaymentTerm = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Henter en varegruppe via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByProductGroupNumber(productGroupNumber: number) {
            let url: string = baseUrl + "/product-groups" + "/" + productGroupNumber
            axios.get<IProductGroups>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<IProductGroups>) => {
                    this.singleProductGroup = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        // Henter en vare via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByProductNumber(productNumber: number) {
            let url: string = baseUrl + "/products" + "/" + productNumber
            axios.get<IProduct>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<IProduct>) => {
                    this.singleProduct = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        //getBySupplierNumber(supplierNumber: number) {
            //let url: string = baseUrl + "/suppliers" + "/" + supplierNumber + "?demo=true"
            //axios.get<ISupplier>(url)
                //.then((response: AxiosResponse<ISupplier>) => {
                    //this.singleSupplier = response.data
                //})
                //.catch((error: AxiosError) => {
                    //this.message = error.message
                    //alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                //})
        //}
        // Henter en enhed via id, og headeren nedenunder bruges til at få adgang til Vismas restapi til Michaels data fra hans app.
        getByUnitNumber(unitNumber: number) {
            let url: string = baseUrl + "/units" + "/" + unitNumber
            axios.get<IUnit>(url, {
                headers: {
                    'X-AppSecretToken': 'Nc5GgaQfU1BFerxYMkZt8HSRtjjVon3MueTTgWj9B2k1',
                    'X-AgreementGrantToken': 'iHEjAGnzPqtNMQkG1r5h4ESTE38EpuTwBpNrGot2bss1',
                    'Content-Type': 'application/json'
                }
            })
                .then((response: AxiosResponse<IUnit>) => {
                    this.singleUnit = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        }
    }
})