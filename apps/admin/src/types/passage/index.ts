export interface PendingReviewPassages {
    _count?: Count;
    author?: Author;
    authorId?: number;
    coverImageUrl?: string;
    favorites?: string[];
    lastEditTime?: string;
    passageLikes?: string[];
    PassageToTag?: PassageToTag[];
    pid?: number;
    publishTime?: string;
    title?: string;
    views?: number;
    [property: string]: any;
}

export interface Passage {
    _count: Count;
    author: Author;
    authorId: number;
    content: string;
    coverImageUrl: string;
    favorites: string[];
    images: Image[];
    lastEditTime: string;
    passageLikes: string[];
    PassageToTag: PassageToTag[];
    pid: number;
    publishTime: string;
    title: string;
    videoUrl: string;
    views: number;
    [property: string]: any;
}

export interface Image {
    url?: string;
    [property: string]: any;
}

export interface PassageImage {
    id: number;
    pid: number;
    url: string;
    [property: string]: any;
}

export interface PassageToTag {
    tag: Tag;
    [property: string]: any;
}

export interface Tag {
    name: string;
    tid: number;
    [property: string]: any;
}

export interface Count {
    comments: number;
    favorites: number;
    passageLikes: number;
    [property: string]: any;
}

export interface Author {
    avatar: string;
    followers: string[];
    uid: number;
    username: string;
    [property: string]: any;
}
