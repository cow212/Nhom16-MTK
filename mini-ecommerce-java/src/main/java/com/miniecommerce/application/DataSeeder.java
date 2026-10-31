package com.miniecommerce.application;

import com.miniecommerce.domain.entity.Product;
import com.miniecommerce.domain.entity.User;
import com.miniecommerce.infrastructure.repository.IUnitOfWork;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Dữ liệu mẫu (Seeder).
 * DB dùng H2 in-memory (create-drop) nên mỗi lần khởi động sẽ trống —
 * Seeder tự chèn sản phẩm mẫu khi DB chưa có dữ liệu nào.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final IUnitOfWork unitOfWork;

    public DataSeeder(IUnitOfWork unitOfWork) {
        this.unitOfWork = unitOfWork;
    }

    @Override
    @Transactional
    public void run(String... args) {
        var productRepo = unitOfWork.repository(Product.class);
        if (productRepo.count() > 0) {
            return; // Đã có dữ liệu, không seed lại
        }

        List<Product> products = List.of(
                // ============ ĐIỆN TỬ ============
                product("Tai nghe Bluetooth Prime", "Tai nghe không dây, chống ồn chủ động, pin lên tới 30 giờ.",
                        599000, 120, "DT-001", "Điện tử", "dt-tai-nghe"),
                product("Bàn phím cơ TKL", "Switch cơ Red, kết nối USB-C, khung nhôm chắc chắn.",
                        1290000, 45, "DT-002", "Điện tử", "dt-ban-phim"),
                product("Sạc nhanh 65W GaN", "Công suất 65W, 2 cổng USB-C và 1 cổng USB-A, nhỏ gọn.",
                        349000, 220, "DT-003", "Điện tử", "dt-sac-nhanh"),
                product("Loa Di Động Mini", "Loa mini pin 12 giờ, kết nối Bluetooth 5.0, chống nước IPX5.",
                        899000, 60, "DT-004", "Điện tử", "dt-loa-mini"),

                // ============ THỜI TRANG ============
                product("Áo Thun Cotton Unisex", "Chất liệu 100% cotton, đường may chuẩn, đa dạng màu sắc.",
                        189000, 350, "TT-001", "Thời trang", "tt-ao-thun"),
                product("Quần Jean Slim Fit", "Denim co giãn, phom slim hiện đại, dễ dàng phối đồ.",
                        429000, 180, "TT-002", "Thời trang", "tt-quan-jean"),
                product("Áo Khoác Gió", "Chống gió nhẹ, thiết kế trẻ trung, cầm nhẹ và gọn gàng.",
                        559000, 90, "TT-003", "Thời trang", "tt-ao-khoac"),

                // ============ GIA ĐÌNH ============
                product("Bộ Chén Sứ 18 Món", "Sứ tráng men trắng, dùng an toàn cho lò vi sóng và máy rửa chén.",
                        569000, 80, "GD-001", "Gia đình", "gd-chen-su"),
                product("Nồi Inox 22cm", "Thân inox cao cấp, đáy chịu nhiệt, dùng cho mọi loại bếp.",
                        749000, 55, "GD-002", "Gia đình", "gd-noi-inox"),
                product("Đèn Bàn LED", "3 mức sáng điều chỉnh, tích hợp pin sạc qua USB-C.",
                        259000, 150, "GD-003", "Gia đình", "gd-den-ban"),

                // ============ THỂ THAO ============
                product("Giày Chạy Bộ Air", "Đế đệm khí êm chân, phù hợp chạy đường dài và tập thể dục.",
                        1290000, 70, "ST-001", "Thể thao", "st-giay-chay"),
                product("Thảm Tập Yoga", "Thảm 6mm không trượt, kèm dây đai cất gọn khi di chuyển.",
                        199000, 200, "ST-002", "Thể thao", "st-tham-yoga"));

        // ============ USER MẪU ============
        // Frontend đang hardcoded userId = 1 (chưa có auth), nên cần user Id = 1
        var userRepo = unitOfWork.repository(User.class);
        if (userRepo.count() == 0) {
            User guest = new User();
            guest.setUsername("guest");
            guest.setEmail("guest@miniecommerce.local");
            guest.setPasswordHash("");
            guest.setFullName("Khách Demo");
            guest.setPhoneNumber("0900000000");
            guest.setAddress("Số 1 Đường Đại Học, TP.HCM");
            userRepo.save(guest);
            System.out.println("[DataSeeder] Đã seed user mẫu (username = guest).");
        }

        products.forEach(productRepo::save);

        System.out.println("[DataSeeder] Đã seed " + products.size() + " sản phẩm mẫu.");
    }

    private Product product(String name, String description, long price, int stock,
                            String sku, String category, String imageSeed) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(BigDecimal.valueOf(price));
        product.setStockQuantity(stock);
        product.setSku(sku);
        product.setCategory(category);
        product.setImageUrl("https://picsum.photos/seed/" + imageSeed + "/600/450");
        product.setActive(true);
        return product;
    }
}
