const phrases: { eng: string; vi: string }[] = [
  {
    eng: 'Login Success',
    vi: 'Đăng nhập thành công'
  },
  {
    eng: 'Logout Success',
    vi: 'Đăng xuất thành công'
  },
  {
    eng: 'Incorrect Email or Password',
    vi: 'Tài khoản hoặc mật khẩu không chính xác'
  },
  {
    eng: 'Update user profile success',
    vi: 'Cập nhật thông tin thành công'
  },
  {
    eng: "You can't borrow the same book twice in 1 day",
    vi: 'Không thể mượn cùng 1 quyển sách 2 lần trong 1 ngày'
  },
  {
    eng: 'Change password success',
    vi: 'Thay đổi mật khẩu thành công'
  },
  {
    eng: 'Old password mismatch',
    vi: 'Mật khẩu cũ không chính xác'
  },
  {
    eng: 'Update user address success',
    vi: 'Cập nhật địa chỉ thành công'
  }
]

export const translate = (word: string) => {
  if (phrases.find((item) => item.eng === word)) {
    return phrases.find((item) => item.eng === word)?.vi
  }
  return word
}
