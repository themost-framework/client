
export interface AccessLevelType {
    additionalType?: string;
    alternateName?: string;
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    disambiguatingDescription?: string;
    id?: number;
    identifier?: string;
    image?: string;
    modifiedBy?: number;
    name?: string;
    sameAs?: string;
    url?: string;
}

export interface AccessToken {
    access_token?: string;
    client_id?: string;
    expires?: Date;
    refresh_token?: string;
    scope?: string;
    user_id?: string;
}

export interface Account  extends Thing {
}

export interface Thing {
    additionalType?: string;
    alternateName?: string;
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    disambiguatingDescription?: string;
    id?: number;
    identifier?: string;
    image?: string;
    modifiedBy?: number;
    name?: string;
    sameAs?: string;
    url?: string;
}

export interface Action  extends Thing {
    actionStatus?: (ActionStatusType | any);
    agent?: (Party | any);
    endTime?: Date;
    error?: (Thing | any);
    instrument?: (Thing | any);
    location?: (Place | any);
    object?: (Thing | any);
    participant?: (Person | any);
    result?: (Thing | any);
    startTime?: Date;
    target?: any;
}

export interface ActionStatusType {
    additionalType?: string;
    alternateName?: string;
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    disambiguatingDescription?: string;
    id?: number;
    identifier?: string;
    image?: string;
    modifiedBy?: number;
    name?: string;
    sameAs?: string;
    url?: string;
}

export interface Party  extends Thing {
    address?: (PostalAddress | any);
    awards?: any[];
    email?: string;
    faxNumber?: string;
    sponsor?: (Party | any);
    taxID?: string;
    telephone?: string;
    vatID?: string;
}

export interface PostalAddress  extends ContactPoint {
    addressCountry?: (Country | any);
    addressLocality?: string;
    addressRegion?: string;
    postOfficeBoxNumber?: string;
    postalCode?: string;
    streetAddress?: string;
}

export interface ContactPoint  extends StructuredValue {
    contactType?: string;
    email?: string;
    faxNumber?: string;
    telephone?: string;
}

export interface StructuredValue  extends Intangible {
}

export interface Intangible  extends Thing {
}

export interface Country  extends AdministrativeArea {
    cca2?: string;
    cca3?: string;
    cioc?: string;
    currency?: string;
    official?: string;
}

export interface AdministrativeArea  extends Place {
}

export interface Place  extends Thing {
    address?: (PostalAddress | any);
    branchCode?: string;
    containedIn?: (Place | any);
    containsPlace?: (Place | any)[];
    faxNumber?: string;
    geo?: (GeoCoordinates | any);
    globalLocationNumber?: string;
    isAccessibleForFree?: boolean;
    logo?: string;
    map?: string;
    maximumAttendeeCapacity?: number;
    photo?: any;
    photos?: any;
    publicAccess?: boolean;
    reviews?: any;
    telephone?: string;
}

export interface GeoCoordinates  extends StructuredValue {
    address?: (PostalAddress | any);
    addressCountry?: (Country | any);
    elevation?: string;
    latitude?: number;
    longitude?: number;
    postalCode?: string;
}

export interface Person  extends Party {
    additionalName?: string;
    affiliation?: (Organization | any);
    alumniOf?: (EducationalOrganization | any);
    birthDate?: Date;
    birthPlace?: (Place | any);
    children?: (Person | any)[];
    colleagues?: (Person | any)[];
    familyName?: string;
    follows?: (Person | any)[];
    gender?: (GenderType | any);
    givenName?: string;
    homeLocation?: (ContactPoint | any);
    honorificPrefix?: string;
    honorificSuffix?: string;
    jobTitle?: string;
    knows?: (Person | any)[];
    memberOf?: (Organization | any);
    nationality?: (Country | any);
    orders?: (Order | any)[];
    siblings?: (Person | any)[];
    user?: (User | any);
    workLocation?: (Place | any);
    worksFor?: (Organization | any)[];
}

export interface GenderType {
    additionalType?: string;
    alternateName?: string;
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    disambiguatingDescription?: string;
    id?: number;
    identifier?: string;
    image?: string;
    modifiedBy?: number;
    name?: string;
    sameAs?: string;
    url?: string;
}

export interface Organization  extends Party {
    department?: (Organization | any);
    dissolutionDate?: Date;
    employees?: (Person | any)[];
    founders?: (Person | any)[];
    foundingDate?: Date;
    globalLocationNumber?: string;
    legalName?: string;
    location?: (Place | any);
    logo?: string;
    memberOf?: (Organization | any);
    members?: (Person | any)[];
    subOrganization?: (Organization | any);
}

export interface EducationalOrganization  extends Organization {
    alumni?: (Person | any)[];
}

export interface User  extends Account {
    enabled?: boolean;
    groups?: (Group | any)[];
    lastLogon?: Date;
    lockoutTime?: Date;
    logonCount?: number;
    userFlags?: number;
}

export interface Group  extends Account {
    members?: (Account | any)[];
}

export interface Order {
    acceptedOffer?: (Offer | any);
    additionalType?: string;
    billingAddress?: (PostalAddress | any);
    createdBy?: number;
    customer?: (Person | any);
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    discount?: number;
    discountCode?: string;
    discountCurrency?: string;
    id?: number;
    isGift?: boolean;
    merchant?: (Party | any);
    modifiedBy?: number;
    orderDate?: Date;
    orderNumber?: string;
    orderStatus?: (OrderStatusType | any);
    orderedItem?: (Product | any);
    paymentDue?: Date;
    paymentMethod?: (PaymentMethod | any);
    paymentUrl?: string;
}

export interface Offer  extends Intangible {
    itemOffered?: (Product | any);
    offeredBy?: (Organization | any);
    price?: number;
    seller?: (Person | any);
    validFrom?: Date;
    validThrough?: Date;
}

export interface Product  extends Thing {
    category?: string;
    discontinued?: boolean;
    isRelatedTo?: (Product | any);
    isSimilarTo?: (Product | any);
    model?: string;
    price?: number;
    productID?: string;
    releaseDate?: Date;
}

export interface OrderStatusType {
    additionalType?: string;
    alternateName?: string;
    color?: string;
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    disambiguatingDescription?: string;
    id?: number;
    identifier?: string;
    image?: string;
    modifiedBy?: number;
    name?: string;
    sameAs?: string;
    url?: string;
}

export interface PaymentMethod {
    additionalType?: string;
    alternateName?: string;
    color?: string;
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    disambiguatingDescription?: string;
    id?: number;
    identifier?: string;
    image?: string;
    modifiedBy?: number;
    name?: string;
    sameAs?: string;
    url?: string;
}

export interface Article  extends CreativeWork {
    articleBody?: string;
    articleSection?: string;
    wordCount?: number;
}

export interface CreativeWork  extends Thing {
    alternativeHeadline?: string;
    author?: (Party | any);
    citation?: (CreativeWork | any)[];
    contentLocation?: (Place | any);
    contentRating?: string;
    contributor?: (Party | any);
    copyrightHolder?: (Party | any);
    copyrightYear?: number;
    datePublished?: Date;
    discussionUrl?: string;
    editor?: (Party | any);
    genre?: string;
    headline?: string;
    inLanguage?: string;
    keywords?: string;
    publisher?: (Party | any);
    sourceOrganization?: (Organization | any);
    text?: string;
    thumbnailUrl?: string;
    version?: string;
}

export interface AudioObject  extends MediaObject {
}

export interface MediaObject  extends CreativeWork {
    associatedArticle?: (Article | any);
    bitrate?: string;
    contentSize?: string;
    contentUrl?: string;
    encodingFormat?: string;
    expires?: Date;
    requiresSubscription?: boolean;
    uploadDate?: Date;
}

export interface AuthClient {
    client_id?: string;
    client_secret?: string;
    grant_type?: string;
    name?: string;
    redirect_uri?: string;
    scopes?: (AuthScope | any)[];
}

export interface AuthScope {
    description?: string;
    id?: number;
    name?: string;
    url?: string;
}

export interface CommunicateAction  extends InteractAction {
    recipient?: (Party | any);
}

export interface InteractAction  extends Action {
}

export interface Enumeration  extends Intangible {
}

export interface Event  extends Thing {
    attendees?: (Party | any)[];
    doorTime?: Date;
    endTime?: Date;
    eventStatus?: (EventStatusType | any);
    performers?: (Party | any)[];
    previousStartDate?: Date;
    startTime?: Date;
    subEvents?: (Event | any)[];
}

export interface EventStatusType {
    additionalType?: string;
    alternateName?: string;
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    disambiguatingDescription?: string;
    id?: number;
    identifier?: string;
    image?: string;
    modifiedBy?: number;
    name?: string;
    sameAs?: string;
    url?: string;
}

export interface FollowAction  extends InteractAction {
    followee?: (Party | any);
}

export interface ImageObject  extends MediaObject {
}

export interface JoinAction  extends InteractAction {
    event?: (Event | any);
}

export interface NavigationElement  extends Thing {
    parent?: (NavigationElement | any);
    scope?: string;
}

export interface Permission {
    account?: (Account | any);
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    id?: number;
    mask?: number;
    modifiedBy?: number;
    parentPrivilege?: string;
    privilege?: string;
    target?: number;
    workspace?: number;
}

export interface ProductCategory {
    description?: string;
    id?: number;
    name?: string;
}

export interface RegisterAction  extends InteractAction {
}

export interface SubscribeAction  extends InteractAction {
}

export interface UserChat {
    commentBy?: number;
    commentText?: string;
    commentTime?: Date;
    commentTitle?: string;
    id?: number;
    replyTo?: (UserChat | any);
}

export interface UserComment {
    commentBy?: (User | any);
    commentFlag?: string;
    commentText?: string;
    commentTime?: Date;
    discusses?: (CreativeWork | any);
    id?: number;
    replyToUrl?: string;
}

export interface UserCredential {
    badPasswordCount?: number;
    badPasswordTime?: Date;
    expirationDate?: Date;
    id?: number;
    pwdLastSet?: boolean;
    userActivated?: boolean;
    userPassword?: string;
}

export interface UserInteraction  extends Event {
}

export interface UserMessage {
    bcc?: string;
    body?: string;
    category?: string;
    cc?: string;
    dateReceived?: Date;
    dateSent?: Date;
    flag?: string;
    id?: number;
    message?: string;
    owner?: number;
    recipient?: string;
    sender?: string;
    subject?: string;
}

export interface VisitorActivity {
    dateCreated?: Date;
    id?: number;
    url?: string;
    visitor?: string;
    visitorBrowser?: (VisitorBrowser | any);
    visitorCountry?: (Country | any);
}

export interface VisitorBrowser {
    additionalType?: string;
    alternateName?: string;
    color?: string;
    createdBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    description?: string;
    disambiguatingDescription?: string;
    id?: number;
    identifier?: string;
    image?: string;
    modifiedBy?: number;
    name?: string;
    sameAs?: string;
    url?: string;
}

export interface Workspace  extends Thing {
}
