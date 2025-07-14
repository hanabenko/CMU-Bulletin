const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUserPosters = functions.auth.user.onDelete(async (user) => {
  const userId = user.uid;

  // Query for all posters uploaded by the deleted user
  const postersRef = admin.firestore().collection('posters');
  const userPostersQuery = postersRef.where('uploaded_by', '==', userId);

  try {
    const snapshot = await userPostersQuery.get();

    if (snapshot.empty) {
      console.log(`No posters found for user ${userId}.`);
      return null;
    }

    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Successfully deleted ${snapshot.size} posters for user ${userId}.`);
    return null;
  } catch (error) {
    console.error(`Error deleting posters for user ${userId}:`, error);
    return null;
  }
});