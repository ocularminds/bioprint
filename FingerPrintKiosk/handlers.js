
const Handlers = {
    handleInitiate: async (accountNumber, kioskStationID) => {
        try {
            const response = await axios.post('http://localhost:3000/api/fingers', { accountNumber, kioskStationID });
            return response.data;
        } catch (error) {
            console.error('Error initiating request:', error);
            return { error: 'Failed to initiate request' };
        }
    },

    handleGetFingers: async (kioskStationID) => {
        try {
            const response = await axios.get(`http://localhost:3000/getRequests/${kioskStationID}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching requests:', error);
            return { error: 'Failed to fetch requests' };
        }
    },

    handleVerifyFinger: async (id, status, fingerprintTemplate) => {
        try {
            const response = await axios.post('http://localhost:3000/api/fingers/'+id+'/verify', { id, status, fingerprintTemplate });
            return response.data;
        } catch (error) {
            console.error('Error updating status:', error);
            return { error: 'Failed to update status' };
        }
    }
};
module.exports = Handlers;
