document.querySelectorAll('.toggle').forEach((toggle) => {
  const name = toggle.closest('.menu-row')?.querySelector('b')?.textContent.trim() || 'notification';
  toggle.classList.toggle('on', ChamverseApp.getToggle(ChamverseApp.KEY.notifications, name, toggle.classList.contains('on')));
  toggle.addEventListener('click', () => {
    const enabled = !toggle.classList.contains('on');
    toggle.classList.toggle('on', enabled);
    ChamverseApp.setToggle(ChamverseApp.KEY.notifications, name, enabled);
    if (name === '전체 알림') {
      document.querySelectorAll('.toggle').forEach((item) => {
        item.classList.toggle('on', enabled);
        const itemName = item.closest('.menu-row')?.querySelector('b')?.textContent.trim();
        if (itemName) ChamverseApp.setToggle(ChamverseApp.KEY.notifications, itemName, enabled);
      });
    }
    ChamverseApp.showToast(`${name} ${enabled ? '알림을 켰어요.' : '알림을 껐어요.'}`);
  });
});

const notificationTime = document.getElementById('notificationTime');
if (notificationTime) {
  notificationTime.value = ChamverseApp.read(ChamverseApp.KEY.notifications, {}).receiveTime || notificationTime.value;
  notificationTime.addEventListener('change', () => {
    const values = ChamverseApp.read(ChamverseApp.KEY.notifications, {});
    values.receiveTime = notificationTime.value;
    ChamverseApp.write(ChamverseApp.KEY.notifications, values);
    ChamverseApp.showToast('알림 수신 시간을 저장했어요.');
  });
}
