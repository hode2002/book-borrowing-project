import _ from 'lodash'

const BookBorrowingStatus = {
  pending: 'Chờ nhận',
  received: 'Đã nhận',
  returned: 'Đã trả',
  renewed: 'Đã gia hạn',
  overdue: 'Quá hạn mượn',
  lost: 'Làm mất'
}

export const convertStatus = (status: string) => {
  return Object.values(_.pick(BookBorrowingStatus, [status]))[0]
}
