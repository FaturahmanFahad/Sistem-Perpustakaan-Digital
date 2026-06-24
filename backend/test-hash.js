const bcrypt = require('bcryptjs');

const hash = '$2a$10$tMh4Hk9R4y0.pU685Y.kQ.u8nB3xQ47wP/b4jV.2iF9kE57gB2aUq';

bcrypt.compare('admin123', hash).then(res => {
  console.log('admin123 matches:', res);
});

bcrypt.compare('user123', hash).then(res => {
  console.log('user123 matches:', res);
});

bcrypt.compare('admin', hash).then(res => {
  console.log('admin matches:', res);
});
