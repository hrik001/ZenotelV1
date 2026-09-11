export const getTokenForApi = async (auth: any) => {
  if (typeof window !== 'undefined' && localStorage.getItem('dummy_logged_in') === 'true') {
    return 'DUMMY_TOKEN';
  }
  if (!auth.currentUser) return null;
  return await auth.currentUser.getIdToken();
};
