import { create, test, enforce } from 'vest';

const collateralDetailsValidation = create((data, t) => {
  // Validate that at least one collateral item exists
  test('collateralList', t?.collateralDetails?.noCollateralError || 'Please add at least one collateral', () => {
    enforce(data.collateralItems).isNotEmpty();
  });

  test('collateralList', t?.collateralDetails?.noCollateralError || 'Please add at least one collateral', () => {
    enforce(data.collateralItems.length).greaterThan(0);
  });
});

export default collateralDetailsValidation;