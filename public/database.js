function showUsers() {
      document.getElementById('users-page').classList.add('active');
      document.getElementById('items-page').classList.remove('active');

      document.getElementById('tab-users').classList.add('active');
      document.getElementById('tab-items').classList.remove('active');
    }

    function showItems() {
      document.getElementById('items-page').classList.add('active');
      document.getElementById('users-page').classList.remove('active');

      document.getElementById('tab-items').classList.add('active');
      document.getElementById('tab-users').classList.remove('active');
    }