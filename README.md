# Tổng quan dự án

## Công nghệ sử dụng

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Queue/Worker**: [BullMQ](https://docs.bullmq.io/) với Redis (Xử lý các tác vụ nền như email, xử lý video)
- **Storage**: [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs/) (Lưu trữ video bài học, hình ảnh)
- **Real-time**: [Socket.io](https://socket.io/) (Thông báo thời gian thực)
- **Authentication**: JWT (JSON Web Token), Cookie-based session
- **Email**: [Resend](https://resend.com/) & React Email
- **Validation**: [Zod](https://zod.dev/) (kết hợp với nestjs-zod)
- **Media Info**: [Fluent-FFmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) (Lấy thời lượng video qua ffprobe)
- **Bot**: Telegram Bot API (Thông báo cho Admin khi có đơn hàng mới)

##  Kiến trúc dự án

Dự án tuân theo cấu trúc module của NestJS:
- `src/routes/`: Chứa các API endpoints chính (Auth, Course, Order, Payment, v.v.)
- `src/shared/`: Các module dùng chung (Prisma, Storage, Mail, v.v.)
- `src/queue/`: Định nghĩa các jobs và processors cho BullMQ.
- `src/websockets/`: Xử lý giao tiếp thời gian thực qua Socket.io.
- `src/cronjobs/`: Các tác vụ lập lịch định kỳ.

## Mô hình dữ liệu (Database Schema)

Hệ thống quản lý các thực thể chính sau:

1.  **Người dùng & Phân quyền (RBAC)**:
    - `User`, `Role`, `Permission`: Hệ thống phân quyền dựa trên Path và Method HTTP.
    - `SessionToken`: Quản lý phiên đăng nhập.
2.  **Khóa học**:
    - `Course`: Có 2 loại `SINGLE` (khóa đơn) và `COMBO` (gồm nhiều khóa đơn).
    - `Chapter` & `Lesson`: Cấu trúc nội dung khóa học. Lesson chứa Video.
3.  **Bán hàng & Thanh toán**:
    - `CartItem`: Giỏ hàng của người dùng.
    - `Order` & `OrderItemSnapshot`: Đơn hàng và bản sao thông tin khóa học tại thời điểm mua.
    - `Payment`: Thông tin giao dịch thanh toán.
    - `Coupon`: Hệ thống mã giảm giá (Phần trăm hoặc số tiền cố định).
4.  **Học tập**:
    - `CourseEnrollment`: Quản lý quyền truy cập của học viên vào khóa học sau khi thanh toán.

## Các tính năng

- **Lấy thông tin Media**: Sử dụng FFmpeg (ffprobe) để lấy thời lượng (duration) của video bài học được lưu trữ trên Azure Blob Storage.
- **Thanh toán**: Hỗ trợ tích hợp gateway (có model `Payment` để theo dõi transaction).
- **Hệ thống Combo**: Cho phép bán gộp các khóa học với nhau.
- **Bảo mật**: Helmet, Throttler (Rate limiting), RBAC chặt chẽ.
- **Xác thực**: Gửi mã OTP qua Email (Resend).
- **Thông báo đơn hàng**: Tự động gửi thông báo đơn hàng mới cho Admin qua Telegram Bot.

## Các Scripts

- `npm run initial-seed-data`: Chạy script khởi tạo dữ liệu mẫu (Seeding).
- `npm run create-permissions`: Tự động quét và tạo danh sách permissions vào database.
- `npm run start:dev`: Chạy project ở chế độ development với hot-reload.

