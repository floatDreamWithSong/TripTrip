import { Passage, PendingReviewPassages } from "@/types/passage";
import { del, get, put } from ".";
import { PageQuery, PassageReview } from "@triptrip/utils";


export const getPendingList = (params: PageQuery) => {
  return get<PendingReviewPassages>('/passage/admin', { params });
};
export const getPassageDetail = (passageId: number) => {
  return get<Passage>('/passage', {
    params: {
      id: passageId
    },
  });
}
export const putReviewStatus = (data: PassageReview) => {
  return put('/passage/admin', data);
};
export const deletePassage = (passageId: number) => {
  return del('/passage',{
    params:{
      passageId
    }
  })
}