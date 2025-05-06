import { get } from ".";
import { BaseResponse, PageQuery } from "@triptrip/utils";

export interface PassageAuthor {
  uid: number;
  username: string;
  avatar: string;
}

export interface PassageImage {
  id: number;
  url: string;
}

export interface PassageTag {
  tid: number;
  name: string;
}

export interface PassageToTag {
  passageId: number;
  tagId: number;
  tag: PassageTag;
}

export interface PendingPassage {
  pid: number;
  title: string;
  authorId: number;
  lastEditTime: string;
  publishTime: string;
  videoUrl: string;
  status: number;
  views: number;
  likes: number;
  author: PassageAuthor;
  PassageImage: PassageImage[];
  PassageToTag: PassageToTag[];
}

export const getPendingList = (params: PageQuery) => {
  return get<PendingPassage[]>('/passage/admin', { params });
};