export const StarFeedBasePattern = 'starfeed.service';

export const getStarFeedPattern = (pattern: string) => {
  return `${StarFeedBasePattern}:${pattern}`;
};

export enum StarFeedPatterns {
  'createPost' = 'CreatePost',
  'getUsername' = 'getUsername',
  getPost = 'getPost',
  getPosts = 'getPosts',
  deletePost = 'DeletePost',
  updatePost = 'updatePost',
  updateBusinessProfile = 'updateBusinessProfile',
  getComments = 'GetComments',
  updateBusinessProfileRequest = 'updateBusinessProfileRequest',
  reportBusiness = 'reportBusiness',
  blockBusiness = 'blockBusiness',
  unblockBusiness = 'unblockBusiness',
  deleteBusiness = 'deleteBusiness',
}
