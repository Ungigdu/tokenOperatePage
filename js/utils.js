export const mergeLog = (A,B)=> {
  let m = []
  let p_a = 0
  let p_b = 0
  while(p_a < A.length || p_b < B.length){
    if (p_a == A.length){
      return m.concat(B.slice(p_b))
    }
    if (p_b == B.length){
      return m.concat(A.slice(p_a))
    }
    if(A[p_a].blockNumber * 1000000000 + A[p_a].transactionIndex <=  B[p_b].blockNumber * 1000000000 + B[p_b].transactionIndex){
      m.push(A[p_a++])
    }else{
      m.push(B[p_b++])
    }
  }
  return m
}
