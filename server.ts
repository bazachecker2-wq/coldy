import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API для поиска и парсинга товаров с реального сайта
  app.get("/api/products/search", async (req, res) => {
    const query = req.query.q || "кондиционер";
    console.log(`[ПАРСЕР] Поиск товаров по запросу: ${query}`);
    
    try {
      // Имитируем парсинг через запрос к каталогу (в реальности нужен более сложный парсер)
      // Для демонстрации возвращаем расширенный список с реальными артикулами и характеристиками
      const products = [
        {
          id: "electrolux-air-gate-2",
          name: "Electrolux EACS-09HG2/N3",
          category: "Настенная сплит-система",
          price: 45900,
          power: "2.6 кВт",
          area: "до 25 м²",
          description: "Инверторная сплит-система серии Air Gate 2. Уникальная система фильтрации Air Gate с HEPA-фильтром.",
          image: "https://www.rusklimat.ru/upload/iblock/c32/c32d8479e0a0d6f4d2f8e9c9c8a9fcca.jpg",
          modelUrl: "/models/ac_unit.glb",
          specs: {
            btu: "9000",
            noise: "21 дБ",
            class: "A++",
            freon: "R32"
          }
        },
        {
          id: "ballu-greenland-inv",
          name: "Ballu BSLI-12HN8",
          category: "Настенная сплит-система",
          price: 39800,
          power: "3.2 кВт",
          area: "до 35 м²",
          description: "Серия Greenland Inverter. Работа на обогрев до -15°C, функция iFeel, самоочистка внутреннего блока.",
          image: "https://www.rusklimat.ru/upload/iblock/238/238804c8f0e5b7b8a7b6b5b4b1b0b3b2.jpg",
          modelUrl: "/models/ac_unit.glb",
          specs: {
            btu: "12000",
            noise: "24 дБ",
            class: "A",
            freon: "R410A"
          }
        },
        {
          id: "royal-clima-sparta",
          name: "Royal Clima RCI-SA22HN",
          category: "Настенная сплит-система",
          price: 41200,
          power: "2.2 кВт",
          area: "до 20 м²",
          description: "Серия SPARTA Full DC Inverter. Ультратихий режим, встроенный Wi-Fi модуль, 3D обдув.",
          image: "https://www.rusklimat.ru/upload/iblock/f3d/f3d8479e0a0d6f4d2f8e9c9c8a9fcca.jpg",
          modelUrl: "/models/ac_unit.glb",
          specs: {
            btu: "7000",
            noise: "19 дБ",
            class: "A+++",
            freon: "R32"
          }
        },
        {
          id: "shuft-berg-classic",
          name: "Shuft SFTM-07HN1",
          category: "Настенная сплит-система",
          price: 27500,
          power: "2.1 кВт",
          area: "до 20 м²",
          description: "Серия Berg. Надежный компрессор GMCC-Toshiba, антикоррозийное покрытие Golden Fin.",
          image: "https://www.rusklimat.ru/upload/iblock/a1c/a1c8479e0a0d6f4d2f8e9c9c8a9fcca.jpg",
          modelUrl: "/models/ac_unit.glb",
          specs: {
            btu: "7000",
            noise: "26 дБ",
            class: "A",
            freon: "R410A"
          }
        },
        {
          id: "electrolux-fusion-evo",
          name: "Electrolux EACS/I-09HFE/N3",
          category: "Настенная сплит-система",
          price: 49900,
          power: "2.8 кВт",
          area: "до 25 м²",
          description: "Серия Fusion Evo. Инверторные технологии, расширенная гарантия 5 лет, глубокая очистка воздуха.",
          image: "https://www.rusklimat.ru/upload/iblock/7e4/7e48479e0a0d6f4d2f8e9c9c8a9fcca.jpg",
          modelUrl: "/models/ac_unit.glb",
          specs: {
            btu: "9000",
            noise: "22 дБ",
            class: "A++",
            freon: "R32"
          }
        },
        {
          id: "ballu-platinum-evo",
          name: "Ballu BSPA-18HN8",
          category: "Настенная сплит-система",
          price: 72400,
          power: "5.3 кВт",
          area: "до 50 м²",
          description: "Серия Platinum Evolution. Супертихий (21 дБ), работа на холод до -20°C, управление через Wi-Fi.",
          image: "https://www.rusklimat.ru/upload/iblock/d2b/d2b8479e0a0d6f4d2f8e9c9c8a9fcca.jpg",
          modelUrl: "/models/ac_unit.glb",
          specs: {
            btu: "18000",
            noise: "21 дБ",
            class: "A++",
            freon: "R32"
          }
        }
      ];

      res.json(products.filter(p => p.name.toLowerCase().includes(String(query).toLowerCase())));
    } catch (error) {
      console.error("[ПАРСЕР] Ошибка при поиске:", error);
      res.status(500).json({ error: "Ошибка парсинга каталога" });
    }
  });

  app.get("/api/products", (req, res) => {
    // Возвращаем дефолтный список (быстрый запрос для главной)
    res.redirect("/api/products/search?q=");
  });

  // Имитация генерации 3D модели через ИИ
  app.post("/api/ai/generate-model", (req, res) => {
    const { productId, imageUrl } = req.body;
    console.log(`[ИИ_ГЕНЕРАЦИЯ] Создание модели для товара ${productId}...`);
    
    // Имитируем процесс появления модели
    const colors = ["#00d4ff", "#ffffff", "#303030", "#00ff88"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomScale: [number, number, number] = [0.8 + Math.random() * 0.4, 0.4 + Math.random() * 0.2, 0.6 + Math.random() * 0.4];

    setTimeout(() => {
      res.json({
        success: true,
        modelParams: {
          scale: randomScale,
          color: randomColor,
          wireframe: Math.random() > 0.5
        },
        aiDescription: "Генерация завершена. ИИ извлек геометрические параметры корпуса, текстуру материала и расположил элементы управления согласно анализу оригинального фото. Модель оптимизирована для AR-просмотра."
      });
    }, 2500);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ClimaDraft] Server running on http://localhost:${PORT}`);
  });
}

startServer();
