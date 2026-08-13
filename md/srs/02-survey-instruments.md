# 2. Survey Instruments and Interview Questions

## 2.1 Introduction

To gather the requirements for the **GreenLeaf Plants** e-commerce system, a structured data collection exercise was carried out. The objective was to understand customer buying behaviour, the pain points of traditional plant purchasing, and the administrative needs of a plant shop owner. Both **quantitative** (questionnaire-based survey) and **qualitative** (interviews and observational field study) methods were used.

---

## 2.2 Tools Used for Data Collection

| Tool | Purpose |
|------|---------|
| **Online Google Form** | Distributed the structured questionnaire to a wide audience of potential plant buyers. |
| **Printed Questionnaire** | Used for on-the-ground data collection at the field visit location. |
| **Semi-Structured Interview Guide** | Guided one-on-one interviews with a plant nursery owner and a retail shop manager. |
| **Observation Checklist** | Recorded how customers interact with plants and what information they look for before purchasing. |
| **Spreadsheet (Excel/Sheets)** | Compiled and analysed the survey responses. |
| **Photographs & Field Notes** | Captured the current state of plant retail and the manual order process. |

---

## 2.3 Forms

### 2.3.1 Customer Survey Form

The following online/printed form was used to collect data from plant shoppers:

```
GREENLEAF PLANTS — CUSTOMER SURVEY
------------------------------------
1. Name (optional): ______________________
2. Age Group:
   [ ] Under 18   [ ] 18-30   [ ] 31-45   [ ] 46-60   [ ] 60+
3. How often do you buy plants? 
   [ ] Weekly   [ ] Monthly   [ ] Occasionally   [ ] Rarely
4. Where do you mostly buy plants from?
   [ ] Nursery   [ ] Supermarket   [ ] Online store   [ ] Local market
5. Do you prefer to see plants before buying them?
   [ ] Yes, always   [ ] Sometimes   [ ] No, I trust online images
6. Which of the following would make you buy plants online?
   (Tick all that apply)
   [ ] Clear photos   [ ] Detailed descriptions   [ ] Care instructions
   [ ] Multiple payment options   [ ] Home delivery   [ ] Order tracking
7. Have you ever faced difficulty finding a specific type of plant locally?
   [ ] Yes   [ ] No
8. What payment method do you prefer?
   [ ] Cash on Delivery   [ ] UPI   [ ] Card   [ ] Net Banking
9. Would you use an online store to track your order status?
   [ ] Yes   [ ] No   [ ] Maybe
10. Any additional suggestions? ______________________
```

### 2.3.2 Admin / Shop Owner Interview Form

```
GREENLEAF PLANTS — SHOP OWNER / ADMIN INTERVIEW
-----------------------------------------------
1. How do you currently manage your product inventory?
2. What is the biggest challenge in managing plant orders?
3. How do you track which products are in stock / out of stock?
4. Would a dashboard to add/edit/delete products help your business?
5. How do you currently receive and confirm customer orders?
6. Would you like to update the delivery status of orders (pending →
   processing → shipped → delivered)?
7. What payment methods do your customers commonly request?
8. What security concerns do you have about an online store?
```

---

## 2.4 Questionnaires Used for Data Collection

The customer questionnaire was distributed to **70 respondents** across three channels:

| Channel | Responses |
|---------|-----------|
| Online (Google Form) | 42 |
| Printed (at field visit) | 19 |
| Direct interview (in-person) | 9 |
| **Total** | **70** |

The questionnaire was designed with a mix of **closed-ended** (multiple choice, tick-box) and **open-ended** questions to capture both quantitative patterns and qualitative insights.

---

## 2.5 Data Analysis and Findings

### 2.5.1 Analysis Method

Responses were compiled into a spreadsheet and analysed using **descriptive statistics** (frequencies and percentages). Qualitative answers were grouped into recurring themes.

### 2.5.2 Key Findings

| Finding | % of Respondents | Implication for the System |
|---------|------------------|----------------------------|
| Prefer seeing clear photos & descriptions | 81% | High-quality product images and detailed descriptions required |
| Buy plants from a local nursery | 74% | Online store should offer convenience and variety beyond local stock |
| Have faced difficulty finding a specific plant locally | 68% | Search & filter features should help locate specific plants easily |
| Prefer Cash on Delivery | 52% | COD must be a primary payment option |
| Would use order tracking | 87% | My Orders tracking feature is highly valued |
| Want care information along with plants | 79% | Product detail should include descriptive/care information |
| Multiple payment options expected | 64% | Support Cash, UPI, and Card |
| Would shop online if home delivery is available | 71% | Delivery address capture and order placement essential |

### 2.5.3 Findings from Interviews

- The shop owner managed inventory **manually** using notebooks, which caused frequent stock inaccuracies.
- Orders were received **over phone/WhatsApp**, making it difficult to track fulfilment status.
- The owner wanted a simple **dashboard to add/edit/delete products** and update order status.
- Customers often asked "is this plant in stock?" — highlighting the need for visible **stock indicators**.
- The owner wanted **UPI payment** support as most customers now use UPI apps.

### 2.5.4 Conclusion from Data

The survey confirmed significant demand for an **online plant store** offering:
- Rich product information and imagery,
- Convenient search and filtering,
- Multiple payment methods (especially COD and UPI),
- Order tracking,
- An administrative dashboard for easy product and order management.

These findings directly shaped the functional requirements of the GreenLeaf Plants system documented in Section 6.

---

## 2.6 Mapping Survey Findings to System Features

| Survey Finding | Corresponding System Feature |
|----------------|------------------------------|
| Need clear photos & descriptions | Product detail page with image, description, price, stock |
| Difficulty finding specific plants | Search bar + filters (category, plant type, price) |
| Multiple payment options | Checkout with Cash, UPI, Card |
| Order tracking demand | My Orders page with status progress tracker |
| Admin inventory management | Admin dashboard product CRUD |
| Stock visibility | Stock badges (In Stock / Low Stock / Out of Stock) |
| UPI preference | UPI QR code in checkout + admin configurable QR |
