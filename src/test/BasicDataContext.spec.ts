import { TestContext } from './TestUtils';
describe("BasicClientDataContext", () => {

  it("should use and", async () => {
    const context = new TestContext();
    await context.authenticate();
    const query = context
      .model("Products")
      .asQueryable()
      .select(({ id, name, category, model, price }) => ({
        id,
        name,
        category,
        model,
        price,
      }))
      .where((x: { price: number, category: string }) => {
        return x.price > 500 && x.category === "Laptops";
      })
      .orderByDescending((x: { price: number, category: string }) => x.price)
      .take(10);
    const data = await query.getItems();
    expect(data).toBeTruthy();
  });

});
