const Db = require('../db');

const Biometrics = {
    async initiate(accountNumber, kioskStationID) {
        const bvn = `BVN-${accountNumber}`; // Simulate BVN retrieval
        await Db.storeRequest(accountNumber, kioskStationID, bvn);
        const requests = await Db.getRequests();
        return requests.find(r => r.AccountNumber === accountNumber && r.KioskStationID === kioskStationID);
    },

    async verify(id, fingerTemplate) { 
        const url = 'http://172.20.236.2:7181/BFM/VerifyFingerPrint'; 
        const requestData = { 
            BVN: '19142042722', DeviceId: 'Z00033141SD', 
            ReferenceNumber: '00033201904120933002251', 
            FingerImage: { 
                type: 'ISO_2005', position: 'RT', nist_impression_type: '0', 
                value: 'Rk1SACAyMAAAAADkAAABQAHgAMUAxQEAAAAxIYEfAV9iT4EGAJ9lO0D/AP9oVED2AMFoS0DkAXdjX4DXASlpYEDOATptX0DMAbpmVoDCAWdrXYC/AMBsTkC9AQjrX4C2AOttV0CrAUDtWkCnAXZ3TkCmAHryQ0CjAWh4VoCjAQ7uX0CiAax+PkCiAJttSECcAbaMPICbAVF6VYCaAYp7U4CRAVz4VoCNAXT6VIBzATyFW4BgATkFVoBSAUwOU0BQAZwZWIA7AOOSRYA0AMkPPkA0AKiSO0AkAWh/QoAbAS0bQAAA' 
            } 
        }; 
        try { 
            const response = await axios.post(url, requestData, { headers: { 'Content-Type': 'application/json' } }); 
            console.log(response.data); 
            return response.data;
        } catch (error) { 
            console.error('Error:', error.response ? error.response.data : error.message); 
        }
    },

    async getRequests(kioskStationID) {
        const requests = await Db.getRequests();
        return requests.filter(r => r.KioskStationID === kioskStationID);
    },

    async update(id, status, fingerprintTemplate) {
        await Db.updateRequestStatus(id, status, fingerprintTemplate);
        const requests = await Db.getRequests();
        return requests.find(r => r.Id === id);
    }
};

module.exports = Biometrics;
