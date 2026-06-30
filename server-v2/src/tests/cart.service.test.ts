import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand, BatchWriteCommand, UpdateCommand, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { addItemToCart, applyCouponToCart, clearCartService, getCartByUserId, removeItemFromCart, updateItemQuantityService } from "../services/cart.service";

const ddbMock = mockClient(DynamoDBDocumentClient);

// clearCart service test
describe("Cart Service Unit Tests - clearCart", () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it("should return early with a firendly message if the cart is already empty", async () => {
        // Arrange: Mock the initial query to return no items
        ddbMock.on(QueryCommand).resolves({ Items: [] });

        // Act
        const result = await clearCartService("user_123");

        // Assert
        expect(result).toEqual({ success: true, message: "Cart already empty" });
    });

    it("should successfully batch-delete items if they exist in the cart", async () => {
        // Arrange: Mock query to find 2 items
        ddbMock.on(QueryCommand).resolves({
            Items: [
                { PK: "USER#user_123", SK: "CART#ITEM#abc" },
                { PK: "USER#user_123", SK: "CART#ITEM#xyz" }
            ]
        });

        // Mock the subsequent batch write command to succeed
        ddbMock.on(BatchWriteCommand).resolves({});

        // Act
        const result = await clearCartService("user_123");

        // Assert
        expect(result).toEqual({ success: true });
    })
});

// addItemToCart service test
describe("Cart Service Unit Tests - addItemToCart", () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it("should successfully issue an update command to upsert an item in the cart", async () => {
        const mockItem = { id: "prod_abc", name: "Coding Hoodie", price_cents: 5000 }

        const mockInput = {
            userId: "user_123",
            item: mockItem,
            quantity: 2
        };

        // Arrange: Mock the UpdateCommand to return the updated attributes
        ddbMock.on(UpdateCommand).resolves({
            Attributes: { quantity: 2, price_cents: 5000 }
        });

        // Act
        const result = await addItemToCart(mockInput.userId, mockInput.item, mockInput.quantity);

        // Assert
        expect(result).toEqual({ 
            Attributes: { quantity: 2, price_cents: 5000 }
         });
    });
});

// removeItemFromCart service test
describe("Cart Service Unit Tests - removeItemFromCart", () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it("should successfully issue a delete commnd to remove a specific item", async () => {
        // Arrange: Mock the DeleteCommand to resolve cleanly
        ddbMock.on(DeleteCommand).resolves({});

        // Act
        const result = await removeItemFromCart("user_123", "prod_abc");

        // Assert
        expect(result).toEqual({});
    })
});

// getCartByUserId service test
describe("Cart Service Unit Tests - getCartByUserId", () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it("should retrieve all rows associated with a user partition key", async () => {
        const mockItems = [
            { PK: "USER#user_123", SK: "CART#ITEM#abc", price_cents: 1000, quantity: 2 },
            { PK: "USER#user_123", SK: "CART#COUPON", type: "PERCENT", amount_cents: 10 }
        ];

        // Arrange
        ddbMock.on(QueryCommand).resolves({ Items: mockItems });

        // Act
        const result = await getCartByUserId("user_123");

        // Assert
        expect(result.Items).toHaveLength(2);
        expect(result.Items).toEqual(mockItems);
    })

});

// applyCouponToCart service test
describe("Cart Service Unit Tests - applyCouponToCart", () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it("should link a validated coupon code record to the user cart partition", async () => {
        const mockCoupon = { code: "SUMMER20", discount_percent: 20 };

        // Arrange: Mock the PutCommand to write the coupon mapping row successfully
        ddbMock.on(PutCommand).resolves({});

        // Act
        const result = await applyCouponToCart("user_123", mockCoupon);

        // Assert
        expect(result).toEqual({ success: true });
    })
});

// updateItemQuantityService service test
describe("Cart Service Unit Tests - updateItemQuantityService", () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it("should successfully update the absolute quantity value of a cart item", async () => {
        // Arrange: Mock UpdateCommand to execute cleanly
        ddbMock.on(UpdateCommand).resolves({});

        // Act
        const result = await updateItemQuantityService("user_123", "prod_abc", 5);

        // Assert
        expect(result).toEqual({});
    })
});

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/jest.setup.js'],
};