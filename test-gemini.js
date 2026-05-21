const apiKey = "AIzaSyCMNyXuiAd4JPhwLneStj1OWXc7h04h8BY";
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log(data.models.map(m => m.name).join("\n"));
    } else {
      console.log(data);
    }
  });
