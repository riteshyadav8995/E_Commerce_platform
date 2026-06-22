const payload = {
  object: "whatsapp_business_account",
  entry: [{
    changes: [{
      value: {
        messages: [{
          from: "919798800286",
          text: { body: "hi" }
        }]
      }
    }]
  }]
};

fetch('http://localhost:5000/api/whatsapp/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(res => res.text())
.then(console.log)
.catch(console.error);
